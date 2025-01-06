import { NextResponse } from "next/server";
import { billAgent } from "@/agents/bill/main";
import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";

const PUBLIC_POSTGRES_URL = process.env.PUBLIC_POSTGRES_URL!;
const PRIVATE_POSTGRES_URL = process.env.PRIVATE_POSTGRES_URL!;

export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url);

    const loggedIn = searchParams.get("loggedIn") as unknown as boolean
    const userId = searchParams.get("userId") as string
    const {graph} = await billAgent({
      userConfig: {
        loggedIn,
        postgresUrl: loggedIn ? PRIVATE_POSTGRES_URL : PUBLIC_POSTGRES_URL,
      },
      sessionId: userId,
      prompt: '',
      cboUrl: '',
      url: '',
    });

    const config = {
      configurable: {
        thread_id: userId,
      }
    };

    const state = await graph.getState(config);
    const messages = state.values.messages || [];
    const filteredMessages = messages.filter((message: any) => !(message instanceof AIMessageChunk))
      .map((message: AIMessage | HumanMessage) => ({
        content: message.content,
        role: message._getType() === 'human' ? 'user' : 'assistant'
      }));

    return NextResponse.json({messages: filteredMessages}, {status: 200});
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {error: error.message},
      {status: error.status ?? 500}
    );
  }
}
