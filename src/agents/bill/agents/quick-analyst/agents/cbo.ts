import { COST_ESTIMATE_PROMPT } from "@/agents/bill/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { Document } from "@langchain/core/documents";
import { fetchAndAnalyzePDFTool } from "@/agents/bill/agents/bill-cost-estimate";
import { AnalystState } from "@/agents/bill/agents/quick-analyst/state";

export async function cboAgent(state: typeof AnalystState.State): Promise<typeof AnalystState.State> {
  if (!state.analysisState.costEstimate?.url) {
    return state
  }

  if (state.analysisState.costEstimate.content && state.analysisState.costEstimate.summary) {
    return state
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
          content: [new Document({pageContent: result.fullContent})],
          summary: analysis.content as string
        },
      },
    };
  } catch (error: any) {
    console.error("Error in cost estimate analysis:", error);
    return state;
  }
}