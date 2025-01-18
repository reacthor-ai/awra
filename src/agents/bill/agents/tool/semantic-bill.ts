import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { CohereEmbeddings } from "@langchain/cohere";
import _ from 'lodash';
import { cohereEmbedding } from "@/agents/cohere";

const CHUNK_SIZE = 512;
const BATCH_SIZE = 48;
const TOP_K = 5;

interface Chunk {
  content: string;
  sectionNumber?: number;
  embedding?: number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

class StreamlinedBillAnalyzer {
  private embeddings: CohereEmbeddings;

  constructor() {
    this.embeddings = cohereEmbedding(BATCH_SIZE);
  }

  private chunkContent(text: string): Chunk[] {
    const sections = text.split(/SECTION \d+\./g);
    const chunks: Chunk[] = [];

    sections.forEach((section, sectionIdx) => {
      if (!section.trim()) return;

      const words = section.trim().split(/\s+/);
      for (let i = 0; i < words.length; i += CHUNK_SIZE) {
        const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
        if (chunk.length > 0) {
          chunks.push({
            content: chunk,
            sectionNumber: sectionIdx > 0 ? sectionIdx : undefined
          });
        }
      }
    });

    return chunks;
  }

  private async embedChunks(chunks: Chunk[]): Promise<Chunk[]> {
    const embeddings = await this.embeddings.embedDocuments(
      chunks.map(c => c.content)
    );

    return chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i]
    }));
  }

  private async findSimilarChunks(queryEmbedding: number[], chunks: Chunk[]): Promise<Document[]> {
    const similarities = chunks
      .map(chunk => ({
        chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, TOP_K);

    return similarities.map(({ chunk, similarity }) => new Document({
      pageContent: chunk.content,
      metadata: {
        sectionNumber: chunk.sectionNumber,
        similarityScore: similarity
      }
    }));
  }

  public async analyzeQuery(content: string, query: string): Promise<Document[]> {
    try {
      const chunks = this.chunkContent(content);

      const embeddedChunks = await this.embedChunks(chunks);

      const queryEmbedding = await this.embeddings.embedQuery(query);
      return this.findSimilarChunks(queryEmbedding, embeddedChunks);

    } catch (error: any) {
      console.error("Error in semantic analysis:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }
}

export const streamlinedBillAnalyzer = tool(
  async ({url, query}) => {
    try {
      const loader = new CheerioWebBaseLoader(url, {
        selector: "pre",
      });
      const docs = await loader.load();
      const content = docs[0].pageContent;

      const analyzer = new StreamlinedBillAnalyzer();
      const results = await analyzer.analyzeQuery(content, query);

      return {
        documents: results,
        query,
        metadata: {
          totalResults: results.length,
          averageSimilarity: _.meanBy(results, doc => doc.metadata.similarityScore),
          sectionsFound: _.uniq(results.map(doc => doc.metadata.sectionNumber)).length
        }
      };

    } catch (error: any) {
      console.error("Error analyzing bill:", error);
      throw new Error(`Failed to analyze bill: ${error.message}`);
    }
  },
  {
    name: "analyze_bill_streamlined",
    description: "Analyzes bill content using direct semantic analysis",
    schema: z.object({
      url: z.string().describe("The URL of the bill to analyze"),
      query: z.string().describe("The query about the bill content")
    })
  }
);