import { BillAnalysisState } from "@/agents/bill/state";
import { createRequestAnalysisTool } from "@/agents/bill/agents/analyze-request/tool";
import { AIMessage } from "@langchain/core/messages"

export const analyzeRequestAgent = async (state: typeof BillAnalysisState.State): Promise<typeof BillAnalysisState.State> => {
  try {
    const requestAnalysis = createRequestAnalysisTool();
    const findLastMessageFromAI = state.messages.findLast((message) =>
      message instanceof AIMessage
    )

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