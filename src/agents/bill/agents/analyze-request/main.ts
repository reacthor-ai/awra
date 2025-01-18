import { BillAnalysisState } from "@/agents/bill/state";
import { createRequestAnalysisTool } from "@/agents/bill/agents/analyze-request/tool";

export const analyzeRequestAgent = async (state: typeof BillAnalysisState.State): Promise<typeof BillAnalysisState.State> => {
  if (!state.analysisState.prompt) {
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        error: "No prompt provided for analysis",
        status: 'error'
      }
    };
  }

  try {
    const requestAnalysis = createRequestAnalysisTool();
    const findLastMessageFromAI = state.messages.findLast((a) => a.getType() === 'ai')

    const result = await requestAnalysis.invoke({
      prompt: state.analysisState.prompt,
      lastMessage: findLastMessageFromAI?.content as string ?? ''
    });
    if (result.type === 'tweet') {
      if (!state.analysisState.mainBill.summary) {
        return {
          ...state,
          analysisState: {
            ...state.analysisState,
            requestTweetPosting: true,
            status: 'analyzing_main'  // Need to analyze bill first
          }
        };
      }

      return {
        ...state,
        analysisState: {
          ...state.analysisState,
          requestTweetPosting: true,
          status: 'init'  // Ready for Twitter engagement
        }
      };
    }

    // For all other cases, continue with normal bill analysis flow
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        requestTweetPosting: false,
        status: 'init'
      }
    };

  } catch (error: any) {
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        error: error.message,
        status: 'error'
      }
    };
  }
};