import { BillAnalysisState } from "@/agents/bill/state";
import { END } from "@langchain/langgraph";

export async function shouldRunCostEstimate(state: typeof BillAnalysisState.State) {
  if (state.analysisState.costEstimate?.url && !state.analysisState.costEstimate?.summary) {
    const response = await fetch(state.analysisState.costEstimate.url);
    if (response.ok) {
      return "cost_estimate";
    }
  }
  return END;
}

export async function shouldProceedWithAnalysis(state: typeof BillAnalysisState.State) {
  if (state.analysisState.status === "error") {
    return END;
  }
  return "bill_analyst";
}