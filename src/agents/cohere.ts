import { CohereClient } from "cohere-ai";
import { CohereRerank } from "@langchain/cohere";

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
