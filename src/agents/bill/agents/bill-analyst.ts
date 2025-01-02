import { MAIN_BILL_PROMPT } from "@/agents/bill/prompts";
import { BillAnalysisState } from "@/agents/bill/state";
import chatAnthropic from '@/agents/anthropic'

async function mainBillAnalysisAgent(state: typeof BillAnalysisState.State) {
  const formattedPrompt = await MAIN_BILL_PROMPT.formatMessages({
    current_time: new Date().toISOString(),
    chat_history: state.messages,
    bill_content: state.analysisState.mainBill.content![0].pageContent
  });

  const response = await chatAnthropic.invoke(formattedPrompt);

  return {
    analysisState: {
      ...state.analysisState,
      mainBill: {
        ...state.analysisState.mainBill,
        summary: response.content
      },
      status: 'fetching_related'
    }
  };
}