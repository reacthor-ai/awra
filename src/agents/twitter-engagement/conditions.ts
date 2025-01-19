import { END } from "@langchain/langgraph";
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { isDirectToConcernCollectionAgent, isDirectToGeneralPost } from "@/agents/twitter-engagement/predicate";

export const shouldProceedToCosponsors = (state: typeof TwitterEngagementState.State) => {
  if (isDirectToConcernCollectionAgent(state)) {
    return END;
  }
  return "analyze_cosponsors";
};

export const shouldDirectToTweetSuggestions = (state: typeof TwitterEngagementState.State) => {
  if (isDirectToGeneralPost(state)) {
    return "suggest_tweets";
  }
  return END;
};

export const shouldProceedToComposition = (state: typeof TwitterEngagementState.State) => {
  // If we have a selected tweet ready for approval
  if (
    (
      state.engagementState.processManagement.status === 'awaiting_tweet_approval' ||
      state.engagementState.processManagement.status === 'retry_tweet_post_error'
    )
    && state.engagementState.post.tweet?.draft
  ) {
    return "compose_tweet";
  }

  return END;
};

export const shouldFinishTweetProcess = (state: typeof TwitterEngagementState.State) => {
  // If tweet is posted successfully
  if (
    state.engagementState.post.tweet?.isPosted ||
    state.engagementState.processManagement.status === 'completed'
  ) {
    return END;
  }

  // If we need to go back to suggestions
  if (state.engagementState.processManagement.status === 'generating_tweet_suggestions') {
    return "suggest_tweets";
  }

  // If it still needs approval or revision
  if (state.engagementState.processManagement.status === 'awaiting_tweet_approval') {
    return "compose_tweet";
  }

  return END;
};