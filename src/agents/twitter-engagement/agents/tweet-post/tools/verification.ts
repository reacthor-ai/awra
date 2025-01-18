import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { TWEET_VERIFICATION_PROMPT } from "@/agents/twitter-engagement/prompts";

const tweetVerificationInputSchema = z.object({
  draft: z.string(),
  userResponse: z.string()
});

const tweetVerificationOutputSchema = z.object({
  type: z.enum(['valid', 'retry', 'invalid']),
  suggestedRevision: z.string().optional(),
  reasoning: z.string().describe("Why this response was interpreted this way")
});

const tweetVerificationTool = {
  type: "function",
  function: {
    name: "verify_tweet",
    description: "Analyzes user's response to tweet draft",
    parameters: zodToJsonSchema(tweetVerificationOutputSchema)
  }
};

const modelWithTool = chatAnthropic.bind({
  tools: [tweetVerificationTool],
  tool_choice: {
    type: "tool",
    name: tweetVerificationTool.function.name
  }
});

export const createTweetVerificationTool = () => {
  return new RunnableLambda({
    func: async (input: z.infer<typeof tweetVerificationInputSchema>) => {
      try {
        const validatedInput = tweetVerificationInputSchema.parse(input);

        const formattedPrompt = await TWEET_VERIFICATION_PROMPT.formatMessages({
          draft_tweet: validatedInput.draft,
          user_response: validatedInput.userResponse
        });

        const response = await modelWithTool.invoke(formattedPrompt);
        const toolCall = response.content[0] as MessageContentComplex;

        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== 'verify_tweet') {
          throw new Error('Invalid tool response format');
        }

        return tweetVerificationOutputSchema.parse(JSON.parse(toolCall.input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};