import { Message as SDKMessage } from "ai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

type SaveMessagesParams = {
  messages: SDKMessage[];
  completion: string;
  graph: any;
  config: object;
};

export async function saveMessages(params: SaveMessagesParams) {
  const {
    messages,
    completion,
    graph,
    config,
  } = params;

  try {
    const userMessage = new HumanMessage(messages[messages.length - 1].content);
    const completionMessage = new AIMessage(completion);
    const conversationMessages = [userMessage, completionMessage];

    try {
      await graph.updateState(config, {
        messages: conversationMessages
      });
    } catch (e) {
    }
    return conversationMessages;
  } catch (error) {
    console.error('Error in saveMessages:', error);
    throw error;
  }
}