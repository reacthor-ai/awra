import { NextRequest, NextResponse } from "next/server";
import { LangChainAdapter, StreamData } from 'ai';
import { billAgent } from "@/agents/bill/main";
import { chatAnthropic } from "@/agents/anthropic";
import { BILL_CHAT_PROMPT } from "@/agents/bill/prompts";
import { saveMessages } from "@/app/c/api/bills/ai/bill-agent/save-message";

const PUBLIC_POSTGRES_URL = process.env.PUBLIC_POSTGRES_URL!;
const PRIVATE_POSTGRES_URL = process.env.PRIVATE_POSTGRES_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      billUrl,
      loggedIn,
      messages,
      cboUrl = null,
    } = body;

    const prompt = messages[messages.length - 1].content;
    const data = new StreamData();

    const {results: billResults, graph} = await billAgent({
      url: billUrl,
      userConfig: {
        loggedIn,
        postgresUrl: loggedIn ? PRIVATE_POSTGRES_URL : PUBLIC_POSTGRES_URL,
      },
      sessionId: userId,
      prompt,
      cboUrl,
    });

    const config = {
      configurable: {
        thread_id: userId,
      }
    };

    const state = await graph.getState(config);
    const formattedPrompt = await BILL_CHAT_PROMPT.formatMessages({
      current_time: new Date().toISOString(),
      chat_history: state.values.messages || [],
      bill_analysis: billResults.analysisState.finalSummary,
      cost_info: billResults.analysisState.costEstimate?.summary
        ? `Cost Estimate Analysis:\n${billResults.analysisState.costEstimate.summary}`
        : "Note: No official cost estimate is currently available for this bill.",
      user_query: prompt
    });

    const stream = await chatAnthropic.stream(formattedPrompt);
    return LangChainAdapter.toDataStreamResponse(stream, {
      data,
      callbacks: {
        onFinal(completion) {
          saveMessages({
            completion,
            messages: [messages[messages.length - 1]],
            config,
            graph
          }).then(() => {

            data.close()
              .then(console.log)
              .catch(console.log)
          })
        }
      }
    });

  } catch (error: any) {
    console.error('Bill analysis error:', error);
    return NextResponse.json(
      {error: error.message},
      {status: error.status ?? 500}
    );
  }
}