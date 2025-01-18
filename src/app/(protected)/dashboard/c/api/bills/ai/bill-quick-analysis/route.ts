import { NextRequest, NextResponse } from "next/server";
import { quickAnalystAgent } from "@/agents/bill/agents/quick-analyst/main";
import { isQuestionBankAvailable } from "@/agents/bill/agents/quick-analyst/predicate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      billUrl,
      cboUrl,
      message,
      sessionId,
    } = body;

    // Validate required fields
    if (!sessionId || !billUrl) {
      return new Response(
        JSON.stringify({error: "Missing required fields"}),
        {status: 400}
      );
    }

    const result = await quickAnalystAgent({
      cboUrl,
      billUrl,
      sessionId,
      prompt: message
    });

    if (result) {
      let content = 'Not Found';

      if (isQuestionBankAvailable(result)) {
        content = result.analysisState.questionBank[message]
      }

      return NextResponse.json({
        content,
      })
    }
    return NextResponse.json({
      content: null,
    })
  } catch (error: any) {
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}