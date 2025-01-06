import { END, START, StateGraph } from "@langchain/langgraph";
import { BillAnalysisState } from "@/agents/bill/state";
import { billAnalystAgent } from "@/agents/bill/agents/bill-analyst";
import { billCostEstimateAgent } from "@/agents/bill/agents/bill-cost-estimate";
import { type CheckpointerConfig, createCheckpointer } from "./checkpointer/main";
import { shouldRunCostEstimate, shouldProceedWithAnalysis } from "@/agents/bill/conditions";
import { billSafetyAgent } from "@/agents/bill/agents/safety-agent/main";

export async function createBillAnalysisWorkflow(config?: CheckpointerConfig) {
  const checkpointer = await createCheckpointer({
    loggedIn: false,
    postgresUrl: process.env.PUBLIC_POSTGRES_URL!
  });

  const workflow = new StateGraph(BillAnalysisState)
    .addNode("safety_check", billSafetyAgent)
    .addNode("bill_analyst", billAnalystAgent)
    .addNode("cost_estimate", billCostEstimateAgent)

    .addEdge(START, "safety_check")
    .addConditionalEdges(
      "safety_check",
      shouldProceedWithAnalysis,
      {
        bill_analyst: "bill_analyst",
        [END]: END
      }
    )
    .addConditionalEdges(
      "bill_analyst",
      shouldRunCostEstimate,
      {
        cost_estimate: "cost_estimate",
        [END]: END
      }
    )
    .addEdge("cost_estimate", END);
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
  userConfig: CheckpointerConfig;
};

export async function billAgent(params: BillAgentParams) {
  const {url, prompt, sessionId, userConfig, cboUrl} = params;

  const {graph, checkpointer,} = await createBillAnalysisWorkflow(userConfig);

  const results = await graph.invoke(
    {
      messages: [],
      analysisState: {
        prompt,
        mainBill: {
          url,
          content: null,
          summary: null,
        },
        costEstimate: {
          url: cboUrl,
          content: null,
          summary: null
        },
        finalSummary: '',
        status: 'init',
        error: null
      }
    },
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