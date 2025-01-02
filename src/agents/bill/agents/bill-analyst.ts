import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { Document } from "@langchain/core/documents";
import { BillAnalysisState } from "@/agents/bill/state";
import { MAIN_BILL_PROMPT } from "@/agents/bill/prompts";
import { chatAnthropic } from "@/agents/anthropic";
import { cohereRerank } from "@/agents/cohere";

const CHUNK_SIZE = 3000;
const MIN_RELEVANCE_SCORE = 0.05;

interface BillSection {
  section_number: number;
  title: string;
  content: string;
  relevanceScore?: number;
}

function extractBillSections(text: string): BillSection[] {
  const mainContent = text.split(/SECTION 1\./)[1] || text;

  const sections: BillSection[] = [];
  const sectionMatches = ('SECTION 1.' + mainContent)
    .matchAll(/SECTION\s+(\d+)\.\s*([^\n]*)\n([\s\S]*?)(?=SECTION\s+\d+\.|$)/gi);

  for (const match of sectionMatches) {
    const content = match[3].trim();
    if (content.length > 10) {
      sections.push({
        section_number: parseInt(match[1]),
        title: match[2].trim(),
        content: content
      });
    }
  }
  return sections;
}

function preprocessQuery(query: string): string {
  const enhancedQuery = query.toLowerCase()
    .replace(/^(what|tell me|explain|describe)\s+(is|about|the)?/i, '')
    .replace(/this bill/i, 'Financial Management Risk Reduction Act')
    .replace(/section/g, 'SECTION')
    .replace(/where/g, 'which section')
    .replace(/what/g, 'which section describes')
    .trim();

  if (enhancedQuery.length < 20) {
    return `key provisions and requirements of ${enhancedQuery}`;
  }

  return enhancedQuery;
}

const fetchAndEmbedBillTool = tool(
  async ({url, query}) => {
    try {
      const loader = new PlaywrightWebBaseLoader(url, {
        launchOptions: {
          args: ['--no-sandbox'],
          headless: true
        },
        gotoOptions: {
          waitUntil: 'networkidle'
        },
        evaluate: async (page) => {
          await page.waitForSelector('pre', {timeout: 10000});
          return page.evaluate(() => document.querySelector('pre')?.textContent || '');
        }
      });

      const docs = await loader.load();
      const billContent = docs[0].pageContent;

      const sections = extractBillSections(billContent);
      const enhancedQuery = preprocessQuery(query);

      const yamlDocs = sections.map(section => {
        const enrichedContent = `${section.title}\n${section.content}`;
        return `
section_number: ${section.section_number}
title: ${section.title}
content: |
  ${enrichedContent.replace(/\n/g, '\n  ')}`.trim();
      });

      const rerankedDocs = await cohereRerank.rerank(
        yamlDocs,
        enhancedQuery,
        {
          model: "rerank-v3.5",
          topN: yamlDocs.length,
          maxChunksPerDoc: Math.ceil(CHUNK_SIZE / 512)
        });

      let relevantSections = rerankedDocs
        .filter(doc => doc.relevanceScore > MIN_RELEVANCE_SCORE)
        .map(doc => ({
          ...sections[doc.index],
          relevanceScore: doc.relevanceScore
        }));

      if (relevantSections.length === 0 && rerankedDocs.length > 0) {
        const topResult = rerankedDocs[0];
        relevantSections = [{
          ...sections[topResult.index],
          relevanceScore: topResult.relevanceScore
        }];
      }

      return {
        documents: [new Document({pageContent: billContent})],
        relevantSections,
        enhancedQuery
      };
    } catch (error: any) {
      console.error("Error in fetch and embed:", error);
      throw new Error(`Failed to fetch bill content: ${error.message}`);
    }
  },
  {
    name: "fetch_and_embed_bill",
    description: "Fetches bill content and finds relevant sections using query-based reranking",
    schema: z.object({
      url: z.string().describe("The URL of the bill to fetch"),
      query: z.string().describe("The specific query about the bill content")
    })
  }
);

export async function billAnalystAgent(state: typeof BillAnalysisState.State) {
  if (!state.analysisState.mainBill?.url || !state.analysisState.prompt) {
    return state;
  }

  try {
    const result = await fetchAndEmbedBillTool.invoke({
      url: state.analysisState.mainBill.url,
      query: state.analysisState.prompt
    });

    const relevantContent = result.relevantSections
      .map((section: BillSection) =>
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
      analysisState: {
        ...state.analysisState,
        mainBill: {
          ...state.analysisState.mainBill,
          content: result.documents,
          summary: analysis.content
        },
        status: 'analyzing_main'
      },
      messages: [...state.messages, analysis]
    };
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