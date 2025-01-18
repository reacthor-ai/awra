import { NextResponse } from "next/server";
import { getAgentStateBySessionId } from "@/agents/bill/helpers";
import { transformMessages } from "@/utils/transformMessages";

export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url);

    const userId = searchParams.get("userId") as string
    if (userId.length === 0) {
      return NextResponse.json({messages: []}, {status: 200});
    }

    const agentState = await getAgentStateBySessionId(userId)
    const messages = transformMessages(agentState.messages || [])

    return NextResponse.json({messages}, {status: 200});
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {error: error.message},
      {status: error.status ?? 500}
    );
  }
}
