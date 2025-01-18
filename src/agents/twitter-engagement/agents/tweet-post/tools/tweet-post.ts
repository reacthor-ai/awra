import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { uuid } from 'uuidv4'
import { TwitterApi } from "twitter-api-v2";

const TweetReplySchema = z.object({
  in_reply_to_tweet_id: z.string(),
  exclude_reply_user_ids: z.array(z.string()).optional()
}).optional();

const TweetRequestSchema = z.object({
  text: z.string().max(280),
  userId: z.string(),
  chatId: z.string(),
  reply: TweetReplySchema,
  reply_settings: z.enum(['mentionedUsers', 'following']).optional(),
  for_super_followers_only: z.boolean().optional(),
  quote_tweet_id: z.string().optional()
});

type TweetRequest = z.infer<typeof TweetRequestSchema>;

export const createTwitterPostTool = () => {
  return new RunnableLambda({
    func: async (input: TweetRequest) => {
      try {
        const validatedInput = TweetRequestSchema.parse(input);

        const client = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY!,
          appSecret: process.env.TWITTER_API_SECRET!,
          accessToken: process.env.TWITTER_ACCESS_TOKEN!,
          accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        });

        const rwClient = client.readWrite;

        const tweet = await rwClient.v2.tweet(validatedInput.text);
        await prisma.tweet.create({
          data: {
            tweetId: tweet.data.id,
            text: tweet.data.text,
            url: `https://twitter.com/i/web/status/${tweet.data.id}`,
            userId: validatedInput.userId,
            chatId: validatedInput.chatId,
            status: 'POSTED'
          }
        });
        return {
          success: true,
          data: {
            id: tweet.data.id,
            text: tweet.data.text,
            url: `https://twitter.com/i/web/status/${tweet.data.id}`
          }
        };
      } catch (error) {
        console.error(`Error`, error)
        // Handle database errors specifically
        if (error instanceof Error && error.message.includes('prisma')) {
          return {
            success: false,
            error: 'Failed to save tweet to database',
            code: 'DATABASE_ERROR'
          };
        }

        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: `Validation error: ${JSON.stringify(error.errors)}`,
            code: 'VALIDATION_ERROR'
          };
        }

        try {
          await prisma.tweet.create({
            data: {
              tweetId: 'failed_' + Date.now() + "_" + uuid().slice(0, 6), // Placeholder ID for failed tweets
              text: input.text,
              url: '',
              userId: input?.userId,
              chatId: input?.chatId,
              status: 'FAILED'
            }
          });
        } catch (dbError) {
          return {
            success: false,
            error: 'Error when saving to db',
            code: 'API_ERROR'
          };
        }

        if (error instanceof Error) {
          return {
            success: false,
            error: error.message || 'Api error',
            code: 'API_ERROR'
          };
        }

        return {
          success: false,
          error: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR'
        };
      }
    }
  });
};