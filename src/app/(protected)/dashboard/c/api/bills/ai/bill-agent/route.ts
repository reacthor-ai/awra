import { NextRequest, NextResponse } from "next/server";
import { LangChainAdapter } from 'ai';
import { billAgent } from "@/agents/bill/main";
import { chatAnthropic } from "@/agents/anthropic";
import { billChatPrompt, BillPromptParams } from "@/agents/bill/prompts";
import { saveMessages } from "@/app/(protected)/dashboard/c/api/bills/ai/bill-agent/save-message";
import { getCosponsors } from "@/api/external/bill/get-bill-by-sponsor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      billUrl,
      loggedIn,
      messages,
      voiceType,
      billNumber,
      sessionId,
      congress,
      chatId,
      userId,
      billType = null,
      cboUrl = null,
    } = body;

    const prompt = messages[messages.length - 1].content;

    const {cosponsors} = billType ? await getCosponsors(process.env.CONGRESS_GOV_API_KEY as string, {
      billNumber,
      congress,
      billType: billType.toLowerCase(),
    }) : {cosponsors: []}

    const {results: billResults, graph, checkpointer} =
      await billAgent({
        url: billUrl,
        sessionId,
        prompt,
        cboUrl,
        cosponsors,
        billNumber,
        userId,
        chatId,
      });

    const config = {
      configurable: {
        thread_id: sessionId,
      }
    };

    const promptParams = {
      current_time: new Date().toISOString(),
      chat_history: billResults.messages || [],
      bill_analysis: billResults.analysisState.mainBill.summary,
      cost_info: billResults.analysisState.costEstimate?.summary
        ? `Cost Estimate Analysis:\n${billResults.analysisState.costEstimate.summary}`
        : "Note: No official cost estimate is currently available for this bill.",
      user_query: prompt,
      voiceType,
      error: billResults.analysisState?.error,
      cosponsors: cosponsors || [],
      requestTweetPosting: billResults.analysisState.requestTweetPosting,
      status: billResults.analysisState.twitter?.processManagement.status ?? 'init',
      agentMessage: billResults.analysisState.twitter?.context?.agentMessage ?? '',
      bill_content: billResults.analysisState.mainBill.content![0] ?
        billResults.analysisState.mainBill.content![0].pageContent :
        billResults.analysisState.mainBill.summary ?? ''
    } satisfies BillPromptParams
    const formattedPrompt = await billChatPrompt(promptParams)
    const stream = await chatAnthropic.stream(formattedPrompt);
    return LangChainAdapter.toDataStreamResponse(stream, {
      callbacks: {
        onFinal(completion) {
          saveMessages({
            completion,
            messages: [messages[messages.length - 1]],
            config,
            graph,
          }).then(async () => {
            await checkpointer.end()
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