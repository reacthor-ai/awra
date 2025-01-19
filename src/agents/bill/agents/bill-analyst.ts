import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { cohereEmbedding } from "@/agents/cohere";
import { cosineSimilarity, maximalMarginalRelevance } from "@langchain/core/utils/math";
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

    // Split into much larger sections that preserve context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 20000,  // Much larger chunks
      chunkOverlap: 2000, // More overlap
      separators: [
        "TITLE ", // Major document divisions
        "SECTION ",
        "\n\nSEC. ",
        "\n\n(a)",
        "\n\n(b)",
        "\n\n"
      ],
      keepSeparator: true
    });

    const chunks = await splitter.createDocuments([content]);

    // Get embeddings
    const queryEmbedding = await embeddings.embedQuery(query);
    const chunkEmbeddings = await embeddings.embedDocuments(
      chunks.map(chunk => chunk.pageContent)
    );

    // Calculate similarities
    const similarities = cosineSimilarity(
      [queryEmbedding],
      chunkEmbeddings
    )[0];

    // Get sections with exact keyword matches
    const exactMatches = chunks.filter((chunk, idx) => {
      const hasMatch = chunk.pageContent.toLowerCase().includes(query.toLowerCase());
      return hasMatch;
    }).map((chunk, idx) => ({
      content: chunk.pageContent,
      section: extractSectionNumber(chunk.pageContent),
      relevanceScore: similarities[idx],
      exactMatch: true
    }));

    // If we have exact matches, send more context
    const contextSize = exactMatches.length > 0 ? 20 : 10;

    // Use MMR to select additional diverse sections
    const mmrIndexes = maximalMarginalRelevance(
      queryEmbedding,
      chunkEmbeddings,
      0.7,
      contextSize  // Send more context to Claude
    );

    const relevantSections = [
      ...exactMatches,
      ...mmrIndexes.map(idx => ({
        content: chunks[idx].pageContent,
        section: extractSectionNumber(chunks[idx].pageContent),
        relevanceScore: similarities[idx],
        exactMatch: false
      }))
    ];

    // Sort by section number for coherence
    relevantSections.sort((a, b) => {
      const aNum = parseInt(a.section) || 0;
      const bNum = parseInt(b.section) || 0;
      return aNum - bNum;
    });

    // Include bill metadata
    const metadata = {
      url,
      totalSections: chunks.length,
      queryMatchSections: exactMatches.length,
      contentPreview: content.substring(0, 1000) // First 1000 chars for context
    };

    return {
      relevantSections,
      documents: [new Document({
        pageContent: relevantSections.map(s => s.content).join('\n\n'),
        metadata
      })],
      enhancedQuery: query
    };
  },
  {
    name: "semantic_bill_tool",
    description: "Analyzes bill content leveraging Claude's large context window",
    schema: z.object({
      url: z.string().describe("The URL of the bill to analyze"),
      query: z.string().describe("The query about the bill content")
    })
  }
);

function extractSectionNumber(text: string): string {
  const sectionMatch = text.match(/SECTION (\d+)|SEC\. (\d+)/i);
  if (sectionMatch) {
    return sectionMatch[1] || sectionMatch[2];
  }
  return '';
}

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
      .map((section: {
        content: string;
        section: string;
        relevanceScore: number;
        exactMatch: boolean;
      }) => {
        if (!section || !section.content) {
          console.warn('Missing section content:', section);
          return '';
        }

        return `SECTION ${section.section || 'Unknown'}:\n${section.content}`;
      })
      .filter((content: any) => content)
      .join('\n\n');

    const formattedPrompt = await MAIN_BILL_PROMPT.formatMessages({
      current_time: new Date().toISOString(),
      chat_history: state.messages,
      bill_content: relevantContent,
      query: result.enhancedQuery
    });

    const analysis = await chatAnthropic.invoke(formattedPrompt, {
      tags: ["analyst"]
    });
    debugger
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