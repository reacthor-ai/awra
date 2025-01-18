import { MAIN_BILL_PROMPT } from "@/agents/bill/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { semanticBillTool } from "@/agents/bill/agents/bill-analyst";
import { AnalystState } from "@/agents/bill/agents/quick-analyst/state";
import { quickQuestions } from "@/utils/constant";


export async function analystAgent(state: typeof AnalystState.State): Promise<typeof AnalystState.State> {
  if (!state.analysisState.mainBill?.url || !state.analysisState.prompt || state.analysisState.mainBill.summary) {
    return state;
  }

  try {
    const result = await semanticBillTool.invoke({
      url: state.analysisState.mainBill.url,
      query: `
        Find the most relevant answers to these questions:
        ${quickQuestions.map(question => question)}
      `
    });

    const relevantContent = result.relevantSections
      .map((section: any) =>
        `Section ${section.section_number}: ${section.title}\n` +
        `Relevance: ${Math.round((section.relevanceScore || 0) * 100)}%\n\n` +
        `${section.content}`
      )
      .join('\n\n' + '-'.repeat(50) + '\n\n');

    const formattedPrompt = await MAIN_BILL_PROMPT.formatMessages({
      current_time: new Date().toISOString(),
      chat_history: state.messages,
      bill_content: relevantContent,
      query: result.enhancedQuery
    });

    const analysis = await chatAnthropic.invoke(formattedPrompt, {
      tags: ["analyst"]
    });
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
        mainBill: {
          ...state.analysisState.mainBill,
          content: result.documents,
          summary: analysis.content as string
        },
      },
    }
  } catch (error: any) {
    console.error("Error in analyst agent:", error);
    return {
      ...state,
      analysisState: {
        ...state.analysisState,
      },
    };
  }
}