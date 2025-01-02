import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";

type Status =
  | 'init'
  | 'fetching_main'
  | 'analyzing_main'
  | 'fetching_related'
  | 'analyzing_related'
  | 'analyzing_impact'
  | 'summarizing'
  | 'complete'
  | 'error';

export const BillAnalysisState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  analysisState: Annotation<{
    // Main bill info
    prompt: string,
    mainBill: {
      url: string;
      content: Document[] | null;
      summary: string | null;
    },
    // Related bills info
    relatedBills?: {
      urls: string[];
      contents: Document[] | null;
      summaries: string[] | null;
    },
    // State impact
    stateImpact?: {
      state: string;
      analysis: string | null;
    },
    costEstimate?: {
      url: string | null
      content: Document[] | null
      summary: string | null
    },
    billDetails?: {
      cosponsors: {
        fullName: string,
        state: string
      }[]
    },
    userDetails?: {
      state: string
    }
    // Final summary
    finalSummary: string | null;
    // Process tracking
    status: Status;
    error: string | null;
  }>(),
});