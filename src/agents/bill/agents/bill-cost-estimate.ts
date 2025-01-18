import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { cohereRerank } from "@/agents/cohere";
import { COST_ESTIMATE_PROMPT } from "@/agents/bill/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { splitIntoChunks } from "@/agents/bill/helpers";
import { BillAnalysisState } from "@/agents/bill/state";

export const fetchAndAnalyzePDFTool = tool(
  async ({url}) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          fullContent: '',
          relevantChunks: []
        };
      }

      const pdfBlob = await response.blob();

      const loader = new WebPDFLoader(pdfBlob, {
        splitPages: true,
        parsedItemSeparator: " ",
      });

      const docs = await loader.load();
      const fullContent = docs.map(doc => doc.pageContent).join("\n");

      const chunks = splitIntoChunks(fullContent);
      const chunkDocs = chunks.map((chunk, index) =>
        new LangChainDocument({
          pageContent: chunk,
          metadata: {
            source: url,
            chunk: index,
            pageNumber: Math.floor(index / (chunks.length / docs.length)) + 1
          }
        })
      );

      const costQuery = "What are the costs, budget impacts, appropriations, and financial implications?";
      const rerankedDocs = await cohereRerank.compressDocuments(chunkDocs, costQuery);

      return {
        fullContent,
        relevantChunks: rerankedDocs.map(doc => ({
          content: doc.pageContent,
          relevanceScore: doc.metadata.relevanceScore,
          pageNumber: doc.metadata.pageNumber
        }))
      };
    } catch (error: any) {
      console.error("Error in PDF analysis:", error);
      return {
        fullContent: '',
        relevantChunks: []
      };
    }
  },
  {
    name: "fetch_and_analyze_pdf",
    description: "Fetches and analyzes cost estimate PDF document",
    schema: z.object({
      url: z.string().describe("The URL of the PDF to analyze")
    })
  }
);

export async function billCostEstimateAgent(state: typeof BillAnalysisState.State): Promise<typeof BillAnalysisState.State> {
  if (!state.analysisState.costEstimate?.url) {
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        status: state.analysisState.status
      },
      ...state.messages
    };
  }

  if (state.analysisState.costEstimate.content && state.analysisState.costEstimate.summary) {
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
      },
    };
  }

  try {
    const result = await fetchAndAnalyzePDFTool.invoke({
      url: state.analysisState.costEstimate.url
    });

    const relevantContent = result.relevantChunks
      .map((chunk: any) => `Section (Page ${chunk.pageNumber}, Relevance: ${Math.round(chunk.relevanceScore * 100)}%):
${chunk.content}`)
      .join('\n\n');

    const formattedPrompt = await COST_ESTIMATE_PROMPT.formatMessages({
      current_time: new Date().toISOString(),
      chat_history: state.messages,
      cost_content: relevantContent
    });

    const analysis = await chatAnthropic.invoke(formattedPrompt, {
      tags: ["analyst"],
    });

    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        costEstimate: {
          ...state.analysisState.costEstimate,
          content: result.documents,
          summary: analysis.content as string
        },
      },
    };
  } catch (error: any) {
    console.error("Error in cost estimate analysis:", error);
    return {
      analysisState: {
        ...state.analysisState,
        costEstimate: {
          ...state.analysisState.costEstimate,
        },
        status: state.analysisState.status
      },
      messages: state.messages
    };
  }
}