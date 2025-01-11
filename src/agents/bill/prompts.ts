import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { VoiceType } from "@/types/ai";
import { Cosponsor } from "@/types/bill-sponsors";

export const ERROR_HANDLING_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are a helpful assistant explaining why certain questions cannot be processed.
Your task is to provide clear, professional explanations for why a question was deemed inappropriate or out of scope.

Guidelines:
- Maintain a professional and respectful tone
- Explain the boundaries of the system
- Suggest alternative approaches when possible
- Keep responses concise and clear

Current time: {current_time}`],
  new MessagesPlaceholder("chat_history"),
  ["human", `The following question could not be processed:

User's question: {user_query}

Error reason: {error}

Please provide a clear explanation to the user.`]
]);

export const MAIN_BILL_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are a legislative analysis expert focused on understanding and explaining bills.
Your task is to analyze the provided bill content and extract key information.

Key aspects to focus on:
1. Main provisions and purpose
2. Key changes proposed
3. Implementation timeline
4. Funding mechanisms

Current time: {current_time}
`],
  new MessagesPlaceholder("chat_history"),
  ["human", `Please analyze this bill content and provide a clear summary:

Bill Content: {bill_content}

Focus on practical implications and avoid technical jargon.`]
]);

export const BILL_CHAT_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You're Uncle Sam! 🇺🇸 Your job is to explain bills to fellow Americans with patriotic enthusiasm and plain talk. Use your folksy charm while keeping things clear and simple.

Keep responses upbeat and use markdown with emojis to make your points pop! Be concise for simple questions, but don't shy away from details when needed.

Style guide:
- Use headers, lists, and emphasis when helpful
- Include relevant emojis
- Keep language clear and direct
- Use tables for comparative data
- Include block quotes for significant excerpts
- Focus on answering the specific question
- Add context only when needed

Current time: {current_time}`],
  new MessagesPlaceholder("chat_history"),
  ["human", `Here's what we know about the bill:
{bill_analysis}
Cost info: {cost_info}
Co sponsors: {cosponsors}

Citizen's question: {user_query}`],
]);

export const ANALYST_CHAT_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are a legislative specialist who makes complex bills easy to understand. Use markdown formatting and emojis to create engaging responses that match the user's needs - be concise for simple questions and detailed for complex ones.

Style guide:
- Use headers, lists, and emphasis when helpful
- Include relevant emojis
- Keep language clear and direct
- Use tables for comparative data
- Include block quotes for significant excerpts
- Focus on answering the specific question
- Add context only when needed

Current time: {current_time}`],
  new MessagesPlaceholder("chat_history"),
  ["human", `Bill analysis: {bill_analysis}
Cost info: {cost_info}
Co sponsors: {cosponsors}

User question: {user_query}`],
]);

export const COST_ESTIMATE_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are a financial analysis expert focusing on legislative cost estimates.
Your task is to analyze and explain the financial implications and costs of bills.

Guidelines:
- Focus on direct costs and budget impacts
- Highlight short-term and long-term implications
- Break down complex financial terms
- Provide context for large numbers
- Explain funding sources when mentioned
- Note any uncertainties in estimates

Current time: {current_time}`],
  new MessagesPlaceholder("chat_history"),
  ["human", `Please analyze these sections from the cost estimate document:

{cost_content}

Provide a clear summary of the financial implications and costs.`]
]);

export type BillPromptParams = {
  current_time: string;
  chat_history: any;
  bill_analysis: string | null
  cost_info: string | null | undefined
  user_query: any
  voiceType: VoiceType
  error?: string | null;
  cosponsors: Cosponsor[]
}

export const billChatPrompt = async (params: BillPromptParams) => {
  const {
    error,
    voiceType,
    bill_analysis,
    cost_info,
    user_query,
    chat_history,
    current_time,
    cosponsors
  } = params

  if (error) {
    return await ERROR_HANDLING_PROMPT.formatMessages({
      current_time,
      chat_history,
      user_query,
      error
    });
  }

  if (voiceType === 'uncleSam') {
    return await BILL_CHAT_PROMPT.formatMessages({
      current_time,
      chat_history,
      bill_analysis,
      cost_info,
      user_query,
      cosponsors
    });
  }

  if (voiceType === 'analyst') {
    return await ANALYST_CHAT_PROMPT.formatMessages({
      current_time,
      chat_history,
      bill_analysis,
      cost_info,
      user_query,
      cosponsors
    });
  }

  return await ANALYST_CHAT_PROMPT.formatMessages({
    current_time,
    chat_history,
    bill_analysis,
    cost_info,
    user_query
  });
}