import { AnalystState } from "@/agents/bill/agents/quick-analyst/state";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { AIMessage } from "@langchain/core/messages";
import { isQuestionBankAvailable } from "@/agents/bill/agents/quick-analyst/predicate";


export async function explainerAgent(state: typeof AnalystState.State): Promise<typeof AnalystState.State> {
  if (!state.analysisState.mainBill.summary) return state;

  if (isQuestionBankAvailable(state)) {
    return state
  }

  try {
    const ANALYST_CHAT_PROMPT = ChatPromptTemplate.fromMessages([
      ["system", `You are a legislative explainer. Provide clear, concise bill summaries under 200 characters. Never ask questions.
    Current time: {current_time}`],
      new MessagesPlaceholder("chat_history"),
      ["human", `Bill: {bill_analysis}
    Cost: {cost_info}
    Query: {user_query}`],
    ]);

    const promptAnalyst = await ANALYST_CHAT_PROMPT.invoke({
      user_query: state.analysisState.prompt,
      current_time: new Date().toISOString(),
      cost_info: state.analysisState.costEstimate?.summary
        ? `Cost Estimate Analysis:\n${state.analysisState.costEstimate.summary}`
        : "Note: No official cost estimate is currently available for this bill.",
      bill_analysis: state?.analysisState.mainBill.summary,
      chat_history: state?.messages
    })

    const aiMessageChunk = await chatAnthropic.invoke(promptAnalyst)

    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        questionBank: {
          ...state.analysisState.questionBank,
          [state.analysisState.prompt]: aiMessageChunk.content as string
        }
      }
    }
  } catch (error) {
    return {
      ...state,
      messages: [
        ...state.messages,
        new AIMessage({content: 'Try again'}),
      ]
    }
  }
}