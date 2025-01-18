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
  type: z.enum(['selected', 'skipped', 'retry', 'invalid']),
  selectedRepresentative: cosponsorSchema.nullable(),
  reasoning: z.string().describe("Explanation for why this selection was interpreted this way")
});

export const REPRESENTATIVE_SELECTION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are helping a user select a representative to contact about a bill.
Process their selection and analyze the user's response, returning one of four types with appropriate reasoning.
if there isn't any representatives just communicate that with the user.

Expected output format for each type:

1. When user selects a valid representative (number from list):
"type": "selected",
"selectedRepresentative": (corresponding representative object),
"reasoning": "User selected a valid number (N) corresponding to [Representative Name]"

2. When user explicitly skips:
"type": "skipped",
"selectedRepresentative": null,
"reasoning": "User explicitly indicated they want to skip selection by saying [exact user input]"

3. When user makes invalid selection but shows intent:
"type": "retry",
"selectedRepresentative": null,
"reasoning": "User attempted to make a selection but [specific reason why invalid, e.g., 'number out of range', 'invalid format']"

4. When user's input is unclear:
"type": "invalid",
"selectedRepresentative": null,
"reasoning": "User's input '[exact input]' doesn't match any expected response pattern and lacks clear intent"

Note: 
- 'skipped' is for explicit skip intent (e.g., "skip", "no", "pass", "0")
- 'retry' is for invalid but genuine attempts to select
- 'invalid' is for unclear or ambiguous responses
- Include specific details in reasoning to explain the decision`],
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

        const representativesList = validatedInput.cosponsors
          .map((rep, index) => `${index + 1}. ${rep.fullName} (${rep.state}, ${rep.party})`)
          .join('\n');

        const formattedPrompt = await REPRESENTATIVE_SELECTION_PROMPT.formatMessages({
          representatives_list: representativesList,
          user_response: validatedInput.userResponse
        });

        const response = await modelWithTools.invoke(formattedPrompt);
        const toolCall = response.content[0] as MessageContentComplex;

        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== 'select_representative') {
          throw new Error('Invalid tool response format');
        }

        return selectionOutputSchema.parse(JSON.parse(toolCall.input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};