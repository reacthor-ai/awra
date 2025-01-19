import { RunnableLambda } from "@langchain/core/runnables";
import { BaseLangGraphError } from '@langchain/langgraph';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { CONCERN_COLLECTION_PROMPT } from "@/agents/twitter-engagement/prompts";

const concernInputSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
  chat_history: z.array(z.any()).optional()
});

const concernOutputSchema = z.object({
  topic: z.string().min(1, "Topic cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  billId: z.string().optional(),
  desiredOutcome: z.string().min(1, "Desired outcome cannot be empty")
}).describe("Structured user concern information");

type ConcernInput = z.infer<typeof concernInputSchema>;
type ConcernOutput = z.infer<typeof concernOutputSchema>;

const concernCollectionTool = {
  type: "function",
  function: {
    name: "collect_concern",
    description: "Collects and structures user concerns about legislation",
    parameters: zodToJsonSchema(concernOutputSchema),
  },
};

const modelWithTool = chatAnthropic.bind({
  tools: [concernCollectionTool],
  tool_choice: {
    type: "tool",
    name: concernCollectionTool.function.name
  }
});

export const createConcernCollectionTool = () => {
  return new RunnableLambda({
    func: async (input: ConcernInput): Promise<ConcernOutput | undefined> => {
      try {
        const validatedInput = concernInputSchema.parse(input);

        const formattedPrompt = await CONCERN_COLLECTION_PROMPT.formatMessages({
          input: validatedInput.input,
          chat_history: validatedInput.chat_history || []
        });

        const response = await modelWithTool.invoke(formattedPrompt);

        const toolCall = response.content[0] as MessageContentComplex;
        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== 'collect_concern') {
          throw new Error('Invalid tool response format');
        }

        const result = JSON.parse(toolCall.input);

        return concernOutputSchema.parse(result);

      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        if (error instanceof BaseLangGraphError) {
          throw new Error(`Concern collection failed: ${error.message}`);
        }
        throw error;
      }
    }
  });
};