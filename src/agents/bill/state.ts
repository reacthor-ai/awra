import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

type Status =
  | 'init'
  | 'fetching_main'
  | 'analyzing_main'
  | 'fetching_related'
  | 'analyzing_related'
  | 'analyzing_impact'
  | 'summarizing'
  | 'validated'
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
    // // State impact
    // stateImpact?: {
    //   state: string;
    //   analysis: string | null;
    // },
    costEstimate?: {
      url: string | null
      content: Document[] | null
      summary: string | null
    },
    finalSummary: string | null;
    status: Status;
    error: string | null;
  }>(),
});

export const agentStateSchema = z.object({
  analysisState: z.object({
    prompt: z.string(),
    mainBill: z.object({
      url: z.string(),
      content: z.array(z.any()).nullable(),
      summary: z.string().nullable(),
    }),
    costEstimate: z.object({
      url: z.string().nullable(),
      content: z.array(z.any()).nullable(),
      summary: z.string().nullable(),
    }).optional(),
    finalSummary: z.string().nullable(),
    status: z.enum([
      'init',
      'fetching_main',
      'analyzing_main',
      'fetching_related',
      'analyzing_related',
      'analyzing_impact',
      'summarizing',
      'validated',
      'complete',
      'error'
    ]),
    error: z.string().nullable(),
  }),
  messages: z.array(z.any())
});