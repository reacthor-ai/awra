import { END, START, StateGraph } from "@langchain/langgraph";
import { BillAnalysisState } from "@/agents/bill/state";
import { billAnalystAgent } from "@/agents/bill/agents/bill-analyst";
import { billCostEstimateAgent } from "@/agents/bill/agents/bill-cost-estimate";
import { type CheckpointerConfig, createCheckpointer } from "./checkpointer/main";

async function isCostEstimateUrlValid(url: string) {
  const response = await fetch(url);
  return response.ok;
}

async function shouldRunCostEstimate(state: typeof BillAnalysisState.State) {
  if (state.analysisState.costEstimate?.url && !state.analysisState.costEstimate?.summary) {
    const isUrlValid = await isCostEstimateUrlValid(state.analysisState.costEstimate.url);
    if (isUrlValid) {
      return "cost_estimate";
    }
  }
  return END;
}

export async function createBillAnalysisWorkflow(config: CheckpointerConfig) {
  const checkpointer = await createCheckpointer(config);

  const workflow = new StateGraph(BillAnalysisState)
    .addNode("bill_analyst", billAnalystAgent)
    .addNode("cost_estimate", billCostEstimateAgent)

    .addEdge(START, "bill_analyst")
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