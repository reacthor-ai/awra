import { END, START, StateGraph } from "@langchain/langgraph";
import { AnalystState } from "@/agents/bill/agents/quick-analyst/state";
import { analystAgent } from "@/agents/bill/agents/quick-analyst/agents/analyst";
import { cboAgent } from "@/agents/bill/agents/quick-analyst/agents/cbo";
import { createCheckpointer } from "@/agents/bill/checkpointer/main";
import { explainerAgent } from "@/agents/bill/agents/quick-analyst/agents/explainer";

const shouldAnalyzeCBO = (state: typeof AnalystState.State) => {
  // Skip CBO if we don't have a URL or already have summary
  if (!state.analysisState.costEstimate?.url ||
    state.analysisState.costEstimate.summary) {
    return "explainer";
  }
  return "analyze_cbo";
};

const afterCBOAnalysis = (state: typeof AnalystState.State) => {
  return "explainer";
};

export async function createBillAnalysisWorkflow() {
  const checkpointer = await createCheckpointer({
    loggedIn: false,
    postgresUrl: process.env.PUBLIC_POSTGRES_URL!
  });

  const workflow = new StateGraph(AnalystState);

  workflow
    .addNode("analyze_bill", analystAgent)
    .addNode("analyze_cbo", cboAgent)
    .addNode("explainer", explainerAgent)

    .addEdge(START, "analyze_bill")

    // From bill analysis, we either go to CBO or explainer
    .addConditionalEdges(
      "analyze_bill",
      shouldAnalyzeCBO,
      {
        analyze_cbo: "analyze_cbo",
        explainer: "explainer"
      }
    )

    // After CBO, we always go to explainer
    .addConditionalEdges(
      "analyze_cbo",
      afterCBOAnalysis,
      {
        explainer: "explainer"
      }
    )

    // Explainer is the final step
    .addEdge("explainer", END);

  return workflow.compile({
    checkpointer
  });
}

type BillAnalystAgentParams = {
  sessionId: string;
  billUrl: string;
  prompt: string;
  cboUrl: string;
}

export async function quickAnalystAgent(params: BillAnalystAgentParams) {
  const {
    sessionId,
    billUrl,
    prompt,
    cboUrl
  } = params;

  try {
    const workflow = await createBillAnalysisWorkflow();

    // Try to get existing state
    const workflowState = await workflow.getState({
      configurable: {
        thread_id: sessionId,
      }
    });

    let state: typeof AnalystState.State;

    if (workflowState.values && "analysisState" in workflowState.values) {
      // Use existing state if available
      state = {
        ...workflowState.values,
        analysisState: {
          ...workflowState.values.analysisState,
          prompt,
          mainBill: {
            ...workflowState.values.analysisState.mainBill,
            url: billUrl
          },
          costEstimate: {
            ...workflowState.values.analysisState.costEstimate,
            url: cboUrl
          }
        }
      } as typeof AnalystState.State;
    } else {
      // Initialize new state
      state = {
        messages: [],
        analysisState: {
          prompt,
          mainBill: {
            url: billUrl,
            summary: null,
            content: null,
          },
          costEstimate: {
            url: cboUrl,
            content: null,
            summary: null
          },
          questionBank: {}
        }
      };
    }
    return await workflow.invoke(state, {
      configurable: {
        thread_id: sessionId
      }
    });
  } catch (error) {
    console.error("Error in bill analysis workflow:", error);
    throw error;
  }
}