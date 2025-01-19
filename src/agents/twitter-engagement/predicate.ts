import { TwitterEngagementState } from "@/agents/twitter-engagement/state";

export const isDirectToConcernCollectionAgent = (state: typeof TwitterEngagementState.State) =>
  !state.engagementState.concernCollection.userConcern ||
  state.engagementState.processManagement.status === 'init'

export const isDirectToGeneralPost = (state: typeof TwitterEngagementState.State) =>
  state.engagementState.processManagement.status === 'generating_tweet_suggestions' ||
  state.engagementState.processManagement.status === 'retry_tweet_post_error' ||
  state.engagementState.processManagement.status === 'awaiting_tweet_selection' ||
  state.engagementState.processManagement.status === 'awaiting_tweet_approval'


