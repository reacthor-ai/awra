import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { cohereEmbedding } from "@/agents/cohere";
import { maximalMarginalRelevance, cosineSimilarity } from "@langchain/core/utils/math";
import { MAIN_BILL_PROMPT } from "@/agents/bill/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { BillAnalysisState } from "@/agents/bill/state";

export const semanticBillTool = tool(
  async ({url, query}) => {
    const embeddings = cohereEmbedding();

    // Load document
    const loader = new CheerioWebBaseLoader(url, {selector: "pre"});
    const [doc] = await loader.load();
    const content = doc.pageContent;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
      separators: ["SECTION", "\n\n", "\n", ". "]
    });

    const chunks = await splitter.createDocuments([content]);

    const queryEmbedding = await embeddings.embedQuery(query);
    const chunkEmbeddings = await embeddings.embedDocuments(
      chunks.map(chunk => chunk.pageContent)
    );

    const similarities = cosineSimilarity(
      [queryEmbedding],
      chunkEmbeddings
    )[0];

    const exactMatches = chunks.map((chunk, idx) => ({
      chunk,
      index: idx,
      similarity: similarities[idx],
      exactMatch: chunk.pageContent.toLowerCase().includes(query.toLowerCase())
    })).filter(item => item.exactMatch);

    const mmrIndexes = maximalMarginalRelevance(
      queryEmbedding,
      chunkEmbeddings,
      0.7,
      5    // Select top 5 chunks
    );

    const selectedIndexes = [
      ...new Set([
        ...exactMatches.map(m => m.index),
        ...mmrIndexes
      ])
    ].slice(0, 5); // Keep top 5 total

    const relevantSections = selectedIndexes.map(idx => {
      const chunk = chunks[idx];
      const sectionMatch = chunk.pageContent.match(/SECTION (\d+)/i);

      return {
        content: chunk.pageContent,
        section_number: sectionMatch ? sectionMatch[1] : `${idx + 1}`,
        relevanceScore: similarities[idx],
        exactMatch: chunk.pageContent.toLowerCase().includes(query.toLowerCase())
      };
    }).sort((a, b) => {
      // Prioritize exact matches, then by relevance score
      if (a.exactMatch && !b.exactMatch) return -1;
      if (!a.exactMatch && b.exactMatch) return 1;
      return b.relevanceScore - a.relevanceScore;
    });

    return {
      relevantSections,
      documents: [new Document({
        pageContent: relevantSections.map(s => s.content).join('\n\n'),
        metadata: { url }
      })],
      enhancedQuery: query
    };
  },
  {
    name: "semantic_bill_tool",
    description: "Analyzes bill content using MMR for diverse and relevant results",
    schema: z.object({
      url: z.string().describe("The URL of the bill to analyze"),
      query: z.string().describe("The query about the bill content")
    })
  }
);

export async function billAnalystAgent(state: typeof BillAnalysisState.State): Promise<typeof BillAnalysisState.State> {
  if (!state.analysisState.mainBill?.url || !state.analysisState.prompt) {
    return state;
  }

  try {
    const result = await semanticBillTool.invoke({
      url: state.analysisState.mainBill.url,
      query: state.analysisState.prompt
    });

    const relevantContent = result.relevantSections
      .map((section: any) =>
        `Section ${section.section_number}\n` +
        `Relevance: ${Math.round(section.relevanceScore * 100)}%\n` +
        `Exact Match: ${section.exactMatch ? "Yes" : "No"}\n\n` +
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
        status: 'analyzing_main'
      },
    }

  } catch (error: any) {
    console.error("Error in bill analyst agent:", error);
    return {
      analysisState: {
        ...state.analysisState,
        error: error.message,
        status: 'error'
      },
      messages: state.messages
    };
  }
}