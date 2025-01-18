import { agentStateSchema, BillAnalysisState } from "@/agents/bill/state";
import { createSafetyCheck } from "./safety-check";
import { z } from "zod";

export async function billSafetyAgent(state: typeof BillAnalysisState.State): Promise<typeof BillAnalysisState.State> {
  if (!state.analysisState.prompt) {
    return state;
  }

  const safetyCheck = createSafetyCheck();

  try {
    const result = await safetyCheck.invoke({
      prompt: state.analysisState.prompt
    });

    let updatedState: typeof BillAnalysisState.State;
    if (result && result.status === "UNSAFE") {
      updatedState = {
        ...state,
        analysisState: {
          ...state.analysisState,
          status: "error",
          error: result.explanation || "This question is not appropriate or out of scope."
        },
      };
    } else {
      updatedState = {
        ...state,
        analysisState: {
          ...state.analysisState,
          status: "validated"
        },
      };
    }

    return updatedState
  } catch (error: any) {
    console.error("Error in safety agent:", error);

    if (error instanceof z.ZodError) {
      return {
        analysisState: {
          ...state.analysisState,
          status: "error",
          error: "Invalid state update: " + JSON.stringify(error.errors)
        },
        messages: state.messages
      };
    }

    return {
      analysisState: {
        ...state.analysisState,
        status: "error",
        error: error.message
      },
      messages: state.messages
    };
  }
}