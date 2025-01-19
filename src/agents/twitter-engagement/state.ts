import { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { Cosponsor } from "@/types/bill-sponsors";
import { z } from 'zod'

export type UserConcern = {
  topic: string;
  description: string;
  billId?: string;
  desiredOutcome: string;
};

export const TweetSuggestionSchema = z.object({
  text: z.string(),
  reasoning: z.string(),
  type: z.enum(['informative', 'call_to_action', 'question']).optional()
});

export const TweetPostSchema = z.object({
  draft: z.string().nullable(),
  isApproved: z.boolean().default(false),
  id: z.string().nullable(),
  // Track if we attempted to post
  isPosted: z.boolean().default(false),
});

export type TweetPost = z.infer<typeof TweetPostSchema>;

export const TwitterStateSchema = z.object({
  twitterHandle: z.string().optional(),
  suggestedTweets: z.array(TweetSuggestionSchema).default([]),
  selectedTweetIndex: z.number().nullable().default(null)
});

export type TwitterState = z.infer<typeof TwitterStateSchema>;

export type EngagementStatus =
  // concern-collection
  | 'init'
  | 'concern_collected'

  // cosponsors-analysis
  | 'awaiting_representative_selection'

  // pick your tweet
  | 'generating_tweet_suggestions'
  | 'awaiting_tweet_selection'

  // tweet approved
  | 'awaiting_tweet_approval'
  // error
  | 'retry_tweet_post_error'

  // processes
  | 'completed'
  | 'error'

  | 'twitter_handle_verified'

export type ExtendedRepresentative = Pick<Cosponsor, 'state' | 'party' | 'fullName'> & {
  twitterHandle?: string;
};

export const TwitterEngagementState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
  engagementState: Annotation<{
    inputInfo: {
      // User input
      prompt: string;
      chatId: string;
      userId: string;
      bill: {
        id: string;
        summary: string | null;
        cosponsors: Cosponsor[];
      } | null;
    },

    concernCollection: {
      userConcern: UserConcern | null;
    },

    // Cosponsors analyzer (Collecting the cosponsor choice) - 2nd step
    cosponsorsSelection: {
      selectedRepresentative: ExtendedRepresentative | null;
      userVerifiedRepresentative: boolean;
    },

    tweetTracker: {
      state: TwitterState | null
    },

    // Process management
    processManagement: {
      status: EngagementStatus;
      error: string | null;
      retryCount: number;
    },

    post: {
      tweet: TweetPost | null;
    },
    context: {
      agentMessage: string
    },
    completed: boolean
    lastInteractionTime: string | null;
  }>(),
});

export type TwitterEngagementStateType = typeof TwitterEngagementState.State;