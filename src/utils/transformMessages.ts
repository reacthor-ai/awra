import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";

export const transformMessages = (messages: (AIMessage | HumanMessage | AIMessageChunk)[]) => messages
  .filter((message) => !(message instanceof AIMessageChunk))
  .map((message: AIMessage | HumanMessage) => ({
    content: message.content,
    role: message._getType() === 'human' ? 'user' : 'assistant'
  }));
