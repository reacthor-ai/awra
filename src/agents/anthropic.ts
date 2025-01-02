import { ChatAnthropic } from "@langchain/anthropic";

export const chatAnthropic = (({streaming}: { streaming: boolean }) => {
  return new ChatAnthropic({
    model: "claude-3-5-sonnet-latest",
    temperature: 0,
    apiKey: process.env.ANTHROPIC_API_KEY,
    streaming,
  });
})({streaming: true});
