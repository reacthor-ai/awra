import { CohereClient } from "cohere-ai";
import { CohereRerank, CohereEmbeddings } from "@langchain/cohere";

export const cohereRerank = (() => {
  const client = new CohereClient({
    token: process.env.COHERE_API_KEY,
  });

  return new CohereRerank({
    client,
    topN: 3,
    model: "rerank-english-v2.0",
  });
})();

export const cohereEmbedding = (batchSize?: number) => {
  const client = new CohereClient({
    token: process.env.COHERE_API_KEY
  })

  return new CohereEmbeddings({
    client,
    ...(batchSize && { batchSize }),
    model: "embed-english-v3.0"
  })
}