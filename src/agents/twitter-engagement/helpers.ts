import { TwitterEngagementStateType } from "@/agents/twitter-engagement/state";

export const handleToolError = (state: TwitterEngagementStateType, error: string): TwitterEngagementStateType => {
  return {
    ...state,
    engagementState: {
      ...state.engagementState,
      error,
      status: 'error',
      lastInteractionTime: new Date().toISOString()
    }
  };
};