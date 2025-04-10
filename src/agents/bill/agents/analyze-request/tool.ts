import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

const IntentSchema = z.object({
  type: z.enum(['tweet', 'analysis', 'question']),
  confidence: z.number().min(0).max(1),
  details: z.object({
    action: z.string(),
    context: z.string().optional(),
    needsAnalysis: z.boolean()
  }),
  reasoning: z.string()
});

const requestAnalysisTool = {
  type: "function",
  function: {
    name: "analyze_request",
    description: "Analyzes user's request to determine their intended action with the bill",
    parameters: zodToJsonSchema(IntentSchema)
  }
};

// Setup Claude with the tool
const modelWithTool = chatAnthropic.bind({
  tools: [requestAnalysisTool],
  tool_choice: {
    type: "tool",
    name: "analyze_request"
  }
});

export const createRequestAnalysisTool = () => {
  return new RunnableLambda({
    func: async ({prompt, lastMessage}: {
      prompt: string;
      lastMessage: string
    }) => {
      try {
        const INTENT_ANALYSIS_PROMPT = PromptTemplate.fromTemplate(`
You are analyzing user messages to determine their intent regarding bill-related queries.

Key patterns to recognize:
1. Tweet/Social Media Intents:
   - Direct: "help me tweet about", "write a tweet", "post on twitter", "post on X", "write on X", "write on X"
   - Indirect: "share this online", "tell others about", "spread the word"
   - Action-oriented: "compose", "draft", "create a post"

2. Analysis/Understanding Intents:
   - Questions about content
   - Requests for explanations
   - Impact analysis queries

User's message: {prompt}
Previous AI response: {lastMessage}

Focus on identifying the core intent. Look for both explicit and implicit indicators of wanting to share on social media.
`);

        const formattedPrompt = await INTENT_ANALYSIS_PROMPT.invoke({
          lastMessage,
          prompt,
        })

        const response = await modelWithTool.invoke(formattedPrompt);

        const toolCall = response.content[0] as MessageContentComplex;
        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== 'analyze_request') {
          throw new Error('Invalid tool response format');
        }

        return IntentSchema.parse(JSON.parse(toolCall.input));

      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    }
  });
};