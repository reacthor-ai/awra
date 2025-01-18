import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { TweetSuggestionSchema } from "@/agents/twitter-engagement/state";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const tweetGenerationInputSchema = z.object({
  topic: z.string(),
  description: z.string(),
  billId: z.string().optional(),
  desiredOutcome: z.string(),
  twitterHandle: z.string().optional(),
  count: z.number().default(3)
});

const tweetGenerationOutputSchema = z.object({
  tweets: z.array(TweetSuggestionSchema)
});

const tweetGenerationTool = {
  type: "function",
  function: {
    name: "generate_tweets",
    description: "Generates multiple tweet options",
    parameters: zodToJsonSchema(tweetGenerationOutputSchema)
  }
};

const modelWithTool = chatAnthropic.bind({
  tools: [tweetGenerationTool],
  tool_choice: {
    type: "tool",
    name: tweetGenerationTool.function.name
  }
});

const TWEET_GENERATION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", "You are an expert at crafting engaging tweets about political and legislative topics."],
  ["user", `Generate {count} different tweet options about this topic:

Topic: {topic}
Description: {description}
Bill ID: {billId}
Desired Outcome: {desiredOutcome}
Twitter Handle: {handle}

For each tweet:
1. Make it concise and impactful (under 280 characters)
2. Include relevant hashtags
3. Provide clear reasoning for the approach
4. Vary the style (informative, call-to-action, question)
5. Include the handle if provided

Remember to format as a valid JSON array of tweets with text and reasoning fields.`]
]);

export const createTweetGenerationTool = () => {
  return new RunnableLambda({
    func: async (input: z.infer<typeof tweetGenerationInputSchema>) => {
      try {
        const validatedInput = tweetGenerationInputSchema.parse(input);

        const formattedPrompt = await TWEET_GENERATION_PROMPT.formatMessages({
          count: validatedInput.count,
          topic: validatedInput.topic,
          description: validatedInput.description,
          billId: validatedInput.billId || "No bill ID",
          desiredOutcome: validatedInput.desiredOutcome,
          handle: validatedInput.twitterHandle || "No handle"
        });

        const response = await modelWithTool.invoke(formattedPrompt);

        const toolCall = response.content[0] as MessageContentComplex;
        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== tweetGenerationTool.function.name) {
          throw new Error('Invalid tool response format');
        }

        return tweetGenerationOutputSchema.parse(JSON.parse(toolCall.input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};