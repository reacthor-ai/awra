import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Document } from "@langchain/core/documents";


export const AnalystState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  analysisState: Annotation<{
    prompt: string
    mainBill: {
      url: string;
      content: Document[] | null;
      summary: string | null;
    },
    costEstimate?: {
      url: string | null
      content: Document[] | null
      summary: string | null
    },
    questionBank: Record<string, string>
  }>(),
});