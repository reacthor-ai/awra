import { createBillAnalysisWorkflow } from "@/agents/bill/main";

export function splitIntoChunks(text: string, chunkSize = 1000): string[] {
  const chunks = [];
  let currentChunk = "";
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += (currentChunk ? " " : "") + sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}

export const getAgentStateBySessionId = async (sessionId: string) => {
  const workflow = await createBillAnalysisWorkflow()
  const workflowState = await workflow.graph.getState({
    configurable: {
      thread_id: sessionId,
    }
  })

  return workflowState.values
}