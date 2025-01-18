import { createTwitterPostTool } from './tools/tweet-post';
import { createTweetVerificationTool } from './tools/verification';
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { z } from "zod";

export async function tweetCompositionAgent(
  state: typeof TwitterEngagementState.State
): Promise<typeof TwitterEngagementState.State> {
  try {
    const currentDraft = state.engagementState.post.tweet?.draft;
    const userInput = state.engagementState.inputInfo.prompt;
    const isReadyForPosting =
      state.engagementState.processManagement.status === 'awaiting_tweet_approval' ||
      state.engagementState.processManagement.status === 'retry_tweet_post_error';

    // Verify and post tweet
    if (isReadyForPosting && currentDraft) {
      const verificationResult = await createTweetVerificationTool().invoke({
        draft: currentDraft,
        userResponse: userInput
      });

      // Handle retry request
      if (verificationResult.type === 'retry') {
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            post: {
              ...state.engagementState.post,
              tweet: { draft: null, isApproved: false, isPosted: false, id: null }
            },
            tweetTracker: {
              ...state.engagementState.tweetTracker,
              state: {
                ...state.engagementState.tweetTracker.state!,
                suggestedTweets: [],
                selectedTweetIndex: null
              }
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'generating_tweet_suggestions'
            },
            context: {
              agentMessage: `The user wants to retry to generate new tweet options, without generating new ones,
              engage in a discussion and try to understand what type of tweets they'd like to generate. 
              here's some context: ${verificationResult?.reasoning}
              their previous concerns for some context: ${state.engagementState.concernCollection?.userConcern}
              here's what they said: ${state.engagementState.inputInfo.prompt}
              `
            }
          }
        };
      }

      // Handle invalid input
      if (verificationResult.type === 'invalid') {
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            context: {
              agentMessage: `Don't communicate there's an error but ask them try again, here's the reason: 
              reason: ${verificationResult.reasoning} ***communicate the reason***
              `
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'retry_tweet_post_error'
            }
          }
        };
      }

      // Handle valid approval
      if (verificationResult.type === 'valid') {
        const postResult = await createTwitterPostTool().invoke({
          text: currentDraft,
          userId: state.engagementState.inputInfo.userId,
          chatId: state.engagementState.inputInfo.chatId
        });

        if (!postResult.success) {
          return {
            ...state,
            engagementState: {
              ...state.engagementState,
              processManagement: {
                ...state.engagementState.processManagement,
                error: `Error posting: ${postResult?.error}`,
                status: 'retry_tweet_post_error'
              },
              context: {
                agentMessage: `There was an issue posting. Communicate to the user why without full internal details.
                Instruct them to try again now or a bit later.
                `
              }
            }
          };
        }

        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            post: {
              ...state.engagementState.post,
              tweet: {
                draft: currentDraft,
                id: postResult.data?.id ?? '',
                isApproved: true,
                isPosted: true
              }
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'init'
            },
            context: {
              agentMessage: `Tweet posted! View it here: https://twitter.com/i/web/status/${postResult.data?.id}`
            },
            completed: true
          }
        };
      }
    }

    return state;
  } catch (error: any) {
    console.error("Error in tweet composition agent:", error);
    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        processManagement: {
          ...state.engagementState.processManagement,
          status: 'retry_tweet_post_error',
          error: error instanceof z.ZodError
            ? "Invalid state update: " + JSON.stringify(error.errors)
            : error.message
        },
        context: {
          agentMessage: "Something went wrong. When posting likely an issue with the x api, inform the user to try again a bit later."
        }
      }
    };
  }
}