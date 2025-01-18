import { BillAnalysisState } from "@/agents/bill/state";

export const isBillAnalystRequested = (state: typeof BillAnalysisState.State) =>
  (state.analysisState?.requestTweetPosting && !state.analysisState?.mainBill.summary) ||
  state.analysisState?.status === 'analyzing_main'

export const isTweetWithSummaryRequested = (state: typeof BillAnalysisState.State) =>
  state.analysisState?.requestTweetPosting && state.analysisState?.mainBill.summary