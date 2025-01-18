import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const CONCERN_COLLECTION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are an assistant helping to collect and structure constituent concerns about legislation.
Your task is to extract key information and return it in a structured format.

Guidelines:
1. If a specific bill is mentioned (format like "HR1234" or "S.123"), include it as billId
2. Focus on concrete policy impacts and specific desired actions
3. Keep descriptions clear and concise
4. Ensure the desired outcome is actionable

Return the information using the collect_concern tool.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"]
]);

export const TWEET_VERIFICATION_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are verifying a user's response to a draft tweet. 

Analyze the response for:
1. Clear approval ('y', 'yes', 'approve', etc.)
2. Clear rejection ('n', 'no', 'reject', etc.)
3. Edit suggestions (any other response)

Consider:
- Case-insensitive matching
- Common variations of approval/rejection
- if the user does not provide a twitter a handle that okay.
- if the users input is '' empty mark it as invalid
- Whether suggestions would improve the tweet
- Character limit compliance`],
  ["human", `Draft tweet: "{draft_tweet}"
User response: "{user_response}"`]
]);