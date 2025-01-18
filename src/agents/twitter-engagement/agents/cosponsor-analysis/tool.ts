import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const cosponsorSchema = z.object({
  fullName: z.string(),
  state: z.string(),
  party: z.string()
});

const selectionInputSchema = z.object({
  userResponse: z.string(),
  cosponsors: z.array(cosponsorSchema)
});

const selectionOutputSchema = z.object({
  selectedRepresentative: cosponsorSchema.nullable(),
  isValid: z.boolean(),
  message: z.string()
});

export const REPRESENTATIVE_SELECTION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are helping a user select a representative to contact about a bill.
Present the list of representatives and process their selection.
Format each representative as: "[number]. [fullName] ([state], [party])"
Allow option '0' for proceeding without selecting a specific representative.
`],
  ["human", `Representatives: {representatives_list}
User's selection: {user_response}`]
]);

const representativeSelectionTool = {
  type: "function",
  function: {
    name: "select_representative",
    description: "Processes user's representative selection",
    parameters: zodToJsonSchema(selectionOutputSchema)
  }
};

const modelWithTools = chatAnthropic.bind({
  tools: [representativeSelectionTool],
  tool_choice: {
    type: "tool",
    name: representativeSelectionTool.function.name
  }
});

export const createSelectionTool = () => {
  return new RunnableLambda({
    func: async (input: z.infer<typeof selectionInputSchema>) => {
      try {
        const validatedInput = selectionInputSchema.parse(input);

        // Format the representatives list
        const representativesList = validatedInput.cosponsors
          .map((rep, index) => `${index + 1}. ${rep.fullName} (${rep.state}, ${rep.party})`)
          .join('\n');

        const formattedPrompt = await REPRESENTATIVE_SELECTION_PROMPT.formatMessages({
          representatives_list: representativesList,
          user_response: validatedInput.userResponse
        });

        const response = await modelWithTools.invoke(formattedPrompt);
        const messageContent = response.content as MessageContentComplex[];

        if (!messageContent || messageContent.length <= 0) {
          throw new Error('No valid tool use response found');
        }

        const toolUseContent = messageContent.find(
          content =>
            "type" in content &&
            content.type === 'tool_use' &&
            content.name === 'select_representative'
        );

        if (!toolUseContent || toolUseContent.type !== 'tool_use') {
          throw new Error('No valid tool use response found');
        }

        const selection = parseInt(validatedInput.userResponse);

        // Handle general concern option (0)
        if (selection === 0) {
          return selectionOutputSchema.parse({
            selectedRepresentative: null,
            isValid: true,
            message: "Proceeding with general concern without specific representative."
          });
        }

        // Validate selection
        if (isNaN(selection) ||
          selection < 1 ||
          selection > validatedInput.cosponsors.length) {
          return selectionOutputSchema.parse({
            selectedRepresentative: null,
            isValid: false,
            message: "Invalid selection. Please choose a valid number from the list."
          });
        }

        const selectedRep = validatedInput.cosponsors[selection - 1];
        return selectionOutputSchema.parse({
          selectedRepresentative: selectedRep,
          isValid: true,
          message: `Selected ${selectedRep.fullName} as the representative to contact.`
        });

      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};