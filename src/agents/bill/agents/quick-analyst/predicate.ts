import { AnalystState } from "@/agents/bill/agents/quick-analyst/state";

export const isQuestionBankAvailable = (state: typeof AnalystState.State) =>
  "questionBank" in state.analysisState &&
  state.analysisState.prompt in state.analysisState.questionBank &&
  state.analysisState.questionBank[state.analysisState.prompt].length > 0