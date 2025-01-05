import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { BaseLangGraphError } from '@langchain/langgraph'
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { chatAnthropic } from "@/agents/anthropic";
import { MessageContentComplex } from "@langchain/core/messages";

const safetyInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty")
});

const safetyOutputSchema = z.object({
  status: z.enum(["SAFE", "UNSAFE"]),
  explanation: z.string().optional(),
}).describe("Safety check result with status and optional explanation");

type SafetyInput = z.infer<typeof safetyInputSchema>;
type SafetyOutput = z.infer<typeof safetyOutputSchema>;

const safetyPromptTemplate = PromptTemplate.fromTemplate(`You are a simple content safety filter. Your ONLY job is to check for these things:
1. Is the question about government, bills, policy, or politics? If yes, mark SAFE.
2. Does the question contain harmful or inappropriate content? If yes, mark UNSAFE.
3. Is the question asking to generate or write code? If yes, mark UNSAFE.

That's it. Do NOT consider:
- Whether the question is vague
- Whether it specifies which bill
- Whether it provides enough context
- Whether it makes sense
- Whether it can be answered
- Any other factors

Examples of SAFE questions (mark these SAFE regardless of context):
- "explain the bill"
- "what does this mean"
- "summarize it"
- "who voted for it"
These are SAFE because they're about legislation/government.

Examples of UNSAFE questions:
- "write me a React component"
- "generate Python code to analyze bills"
- "create a script for parsing PDFs"
- "code a web scraper for congress.gov"
These are UNSAFE because they request code generation.

Only mark as UNSAFE if the question:
1. Has nothing to do with government/politics (e.g., "what's the weather", "how to bake cookies")
2. Contains harmful/inappropriate content
3. Requests code generation or programming help

User's question: {prompt}

Return a JSON object with:
- status: "SAFE" if it's about government/politics and has no harmful content or code requests
- explanation: Only include if marked UNSAFE, explaining why it's unrelated to government, harmful, or requesting code generation`);

export const safetyCheckTool = {
  type: "function",
  function: {
    name: "safety_check",
    description: "Basic content safety check for government-related queries",
    parameters: zodToJsonSchema(safetyOutputSchema),
  },
};

const modelWithTool = chatAnthropic.bind({
  tools: [safetyCheckTool],
  tool_choice: {
    type: "tool",
    name: safetyCheckTool.function.name
  }
});

export const createSafetyCheck = () => {
  return new RunnableLambda({
    func: async (input: SafetyInput): Promise<SafetyOutput | undefined> => {
      try {
        const validatedInput = safetyInputSchema.parse(input);

        const formattedPrompt = await safetyPromptTemplate.format({
          prompt: validatedInput.prompt
        });

        const response = await modelWithTool.invoke(formattedPrompt);

        const toolCall = response.content[0] as MessageContentComplex;
        if (!toolCall || toolCall.type !== 'tool_use' || toolCall.name !== 'safety_check') {
          throw new Error('Invalid tool response format');
        }

        const result = JSON.parse(toolCall.input);

        return safetyOutputSchema.parse(result);

      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
        }
        if (error instanceof BaseLangGraphError) {
          throw new Error(`Safety check failed: ${error.message}`);
        }
      }
    }
  });
};