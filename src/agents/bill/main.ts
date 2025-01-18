import { END, START, StateGraph } from "@langchain/langgraph";
import { BillAnalysisState } from "@/agents/bill/state";
import { billAnalystAgent } from "@/agents/bill/agents/bill-analyst";
import { billCostEstimateAgent } from "@/agents/bill/agents/bill-cost-estimate";
import { createCheckpointer } from "./checkpointer/main";
import { billSafetyAgent } from "@/agents/bill/agents/safety-agent/main";
import { Cosponsor } from "@/types/bill-sponsors";
import { analyzeRequestAgent } from "@/agents/bill/agents/analyze-request/main";
import { twitterEngagementAgent } from "@/agents/twitter-engagement/main";
import { isBillAnalystRequested, isTweetWithSummaryRequested } from "@/agents/bill/predicate";
import { RawSummary } from "@/api/external/bill/get-summaries";

export async function createBillAnalysisWorkflow(sessionId: string) {
  const checkpointer = await createCheckpointer({
    loggedIn: false,
    postgresUrl: process.env.PUBLIC_POSTGRES_URL!
  });

  const workflow = new StateGraph(BillAnalysisState)
    .addNode("analyze_request", analyzeRequestAgent)
    .addNode("safety_check", billSafetyAgent)
    .addNode("bill_analyst", billAnalystAgent)
    .addNode("cost_estimate", billCostEstimateAgent)
    .addNode("twitter_engagement", async (state): Promise<typeof BillAnalysisState.State> => {
      if (!state.analysisState.mainBill.summary) {
        return {
          ...state,
          analysisState: {
            ...state.analysisState,
            status: 'analyzing_main',
            requestTweetPosting: true
          }
        };
      }

      const twitterResult = await twitterEngagementAgent({
        sessionId,
        state,
      });
      return {
        ...state,
        analysisState: {
          ...state.analysisState,
          twitter: twitterResult.engagementState,
          requestTweetPosting: true
        }
      };
    })

  workflow
    .addEdge(START, "analyze_request")

    // After request analysis
    .addConditionalEdges(
      "analyze_request",
      (state) => {
        // If we have a tweet request and already have summary
        if (isTweetWithSummaryRequested(state)) {
          return "twitter_engagement";
        }

        // Otherwise, continue with safety check
        return "safety_check";
      },
      {
        safety_check: "safety_check",
        twitter_engagement: "twitter_engagement",
        [END]: END
      }
    )

    // After safety check
    .addConditionalEdges(
      "safety_check",
      (state) => {
        if (state.analysisState.status === 'error') {
          return END;
        }
        // If requesting tweet but need analysis
        if (isBillAnalystRequested(state)) {
          return "bill_analyst";
        }

        // If requesting tweet and have summary
        if (isTweetWithSummaryRequested(state)) {
          return "twitter_engagement";
        }
        // Normal bill analysis flow
        return "bill_analyst";
      },
      {
        bill_analyst: "bill_analyst",
        twitter_engagement: "twitter_engagement",
        [END]: END
      }
    )

    .addConditionalEdges(
      "bill_analyst",
      (state) => {
        if (state.analysisState.requestTweetPosting) {
          return "twitter_engagement";
        }
        return state.analysisState.costEstimate?.url ?
          "cost_estimate" : END;
      },
      {
        twitter_engagement: "twitter_engagement",
        cost_estimate: "cost_estimate",
        [END]: END
      }
    )
    .addEdge("cost_estimate", END)
    .addEdge("twitter_engagement", END);

  return {
    graph: workflow.compile({
      checkpointer
    }),
    checkpointer,
  }
}

type BillAgentParams = {
  url: string;
  prompt: string;
  sessionId: string;
  cboUrl: string | null
  cosponsors: Cosponsor[]
  billNumber: string
  chatId: string
  userId: string
};

export async function billAgent(params: BillAgentParams) {
  const {
    url,
    prompt,
    sessionId,
    cboUrl,
    cosponsors,
    billNumber,
    chatId,
    userId,
  } = params;

  const {graph, checkpointer,} = await createBillAnalysisWorkflow(sessionId);

  const state = await graph.getState({
    configurable: {
      thread_id: sessionId,
    }
  })

  let defaultState: typeof BillAnalysisState.State

  defaultState = {
    messages: [],
    analysisState: {
      chatId,
      userId,
      twitter: null,
      cosponsors,
      prompt,
      mainBill: {
        url,
        billNumber,
        content: null,
        summary: null,
      },
      relatedBills: {
        urls: [],
        content: null,
        summary: null
      },
      costEstimate: {
        url: cboUrl,
        content: null,
        summary: null
      },
      status: 'init',
      error: null,
      requestTweetPosting: false
    },
  } satisfies typeof BillAnalysisState.State

  if (state && state.values?.analysisState) {
    defaultState = {
      ...state.values,
      analysisState: {
        ...state.values.analysisState,
        userId,
        chatId,
        prompt,
        ...(state.values.analysisState.twitter?.completed && {
          twitter: null
        })
      }
    }
  }

  const results = await graph.invoke(defaultState,
    {
      configurable: {
        thread_id: sessionId
      }
    }
  );
  return {
    results,
    checkpointer,
    graph
  }
}