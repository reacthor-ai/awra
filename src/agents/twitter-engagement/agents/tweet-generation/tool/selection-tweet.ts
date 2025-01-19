import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { TweetSuggestionSchema } from "@/agents/twitter-engagement/state";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const choiceInputSchema = z.object({
  userInput: z.string(),
  tweets: z.array(TweetSuggestionSchema),
  context: z.string().optional()
});

const choiceOutputSchema = z.object({
  type: z.enum(['selection', 'retry', 'invalid', 'suggestion']),
  selectedTweet: TweetSuggestionSchema.optional(),
  suggestedTweet: z.string().optional(),
  reasoning: z.string()
});

const choiceSelectionTool = {
  type: "function",
  function: {
    name: "parse_selection",
    description: "Determines user's choice or if they provided their own tweet",
    parameters: zodToJsonSchema(choiceOutputSchema)
  }
};

const CHOICE_SELECTION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", "You are an expert at understanding user intent in selecting options from a list."],
  ["user", `Determine if the user is selecting from available tweets, suggesting their own, or requesting to retry.

Available tweets:
{tweetsList}

User input: "{userInput}"
{context}

Task:
1. If the user mentions or copies any part of an available tweet, find the matching tweet (type: selection)
2. If they reference a number (like "first one" or "option 2"), select that tweet (type: selection)
3. If they want to try again or see different options, mark as retry (type: retry)
4. If they provide their own tweet text, capture it as a suggestion (type: suggestion)
5. If unclear or invalid, mark as invalid (type: invalid)

Remember: When users write their own tweet, return it in suggestedTweet field and fill out the necessary fields.
Return as structured selection data with reasoning.`]
]);

const modelWithTool = chatAnthropic.bind({
  tools: [choiceSelectionTool],
  tool_choice: {
    type: "tool",
    name: choiceSelectionTool.function.name
  }
});

export const createChoiceSelectionTool = () => {
  return new RunnableLambda({
    func: async (input: z.infer<typeof choiceInputSchema>) => {
      try {
        const validatedInput = choiceInputSchema.parse(input);

        const tweetsList = validatedInput.tweets
          .map((tweet, i) => `${i + 1}. "${tweet.text}"\n   Type: ${tweet.type || 'general'}`).join('\n\n');

        const formattedPrompt = await CHOICE_SELECTION_PROMPT.formatMessages({
          tweetsList,
          userInput: validatedInput.userInput,
          context: validatedInput.context || ""
        });

        const response = await modelWithTool.invoke(formattedPrompt);
        const toolCall = response.content[0] as MessageContentComplex;
        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== choiceSelectionTool.function.name) {
          throw new Error('Invalid tool response format');
        }

        return choiceOutputSchema.parse(JSON.parse(toolCall.input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};