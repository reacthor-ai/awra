import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { z } from "zod";
import { createTweetGenerationTool } from "./tool/generation";
import { createChoiceSelectionTool } from "./tool/selection-tweet";

export async function tweetSuggestionAgent(
  state: typeof TwitterEngagementState.State
): Promise<typeof TwitterEngagementState.State> {

  try {
    const userInput = state.engagementState.inputInfo.prompt;
    const currentStatus = state.engagementState.processManagement.status;
    const suggestions = state.engagementState.tweetTracker.state?.suggestedTweets || [];
    if (currentStatus === 'generating_tweet_suggestions' && suggestions.length === 0) {
      const generator = createTweetGenerationTool();
      const result = await generator.invoke({
        topic: state.engagementState.concernCollection.userConcern?.topic || "",
        description: state.engagementState.concernCollection.userConcern?.description || "",
        billId: state.engagementState.concernCollection.userConcern?.billId,
        desiredOutcome: state.engagementState.concernCollection.userConcern?.desiredOutcome || "",
        representative: state.engagementState.cosponsorsSelection.selectedRepresentative,
        count: 3
      });
      return {
        ...state,
        engagementState: {
          ...state.engagementState,
          tweetTracker: {
            ...state.engagementState.tweetTracker,
            state: {
              ...state.engagementState.tweetTracker.state!,
              suggestedTweets: result.tweets
            }
          },
          processManagement: {
            ...state.engagementState.processManagement,
            status: 'awaiting_tweet_selection'
          },
          context: {
            agentMessage: `Show the user the generated ${result.tweets.length} tweet options:

${result.tweets.map((tweet, i) => `${i + 1}. "${tweet.text}"
   Reasoning: ${tweet.reasoning}`).join('\n\n')}

Tell them to choose one or type "retry" for new options.`
          }
        }
      };
    }

    // Step 2: Handle user selection
    if (currentStatus === 'awaiting_tweet_selection' && suggestions.length > 0) {
      const choiceTool = createChoiceSelectionTool();
      const choiceResult = await choiceTool.invoke({
        userInput,
        tweets: suggestions,
        context: `The user was shown these tweet options and asked to select one, request new options, or provide their own.`
      });
      if (choiceResult.type === 'retry') {
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            concernCollection: {
              userConcern: null
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
              status: 'generating_tweet_suggestions',
            },
            context: {
              agentMessage: `The user wants to retry to generate new tweet options, without generating new ones,
              engage in a discussion and try to understand what type of tweets they'd like to generate. 
              here's some context: ${choiceResult?.reasoning}
              `
            }
          }
        };
      }

      if (
        (choiceResult.type === 'selection' || choiceResult.type === 'suggestion') &&
        choiceResult.selectedTweet
      ) {
        const selectedIndex = suggestions.findIndex(
          tweet => tweet.text === choiceResult.selectedTweet?.text
        ) ?? 0;

        const text = choiceResult.type === 'selection' ? choiceResult.selectedTweet.text :
          choiceResult.suggestedTweet
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            inputInfo: {
              ...state.engagementState.inputInfo,
              prompt: ''
            },
            tweetTracker: {
              ...state.engagementState.tweetTracker,
              state: {
                ...state.engagementState.tweetTracker.state!,
                selectedTweetIndex: selectedIndex
              }
            },
            post: {
              ...state.engagementState.post,
              tweet: {
                draft: text ?? choiceResult.selectedTweet.text,
                isApproved: false,
                isPosted: false,
                id: null
              }
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'awaiting_tweet_approval'
            },
            context: {
              agentMessage: `You selected this tweet:

"${text ?? choiceResult.selectedTweet.text}"

Is this the tweet you want to post? Reply:
- Yes to confirm and post
- No to go back to the options
- Or type your suggested edits`
            }
          }
        };
      }

      return {
        ...state,
        engagementState: {
          ...state.engagementState,
          processManagement: {
            ...state.engagementState.processManagement,
            status: suggestions.length <= 0 ? 'generating_tweet_suggestions' : 'awaiting_tweet_selection'
          },
          context: {
            agentMessage: `The user most likely want to modify a certain aspect of this bill or the request is invalid.
            Previous Suggestions: ${suggestions}
            Reason: ${choiceResult?.reasoning}
            `
          },
        }
      };
    }

    return state

  } catch (error: any) {
    console.error("Error in tweet suggestion agent:", error);
    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        tweetTracker: {
          state: {
            ...state.engagementState.tweetTracker.state!,
            suggestedTweets: [],
            selectedTweetIndex: null
          },
        },
        processManagement: {
          ...state.engagementState.processManagement,
          status: 'generating_tweet_suggestions',
          error: error instanceof z.ZodError
            ? "Invalid state update: " + JSON.stringify(error.errors)
            : error.message
        },
        context: {
          agentMessage: `There was an error handling the users selection. Please ask the user
          for what type of tweet they would like to generate.
          based on the conversation. Don't generate any tweet.
          `
        }
      }
    };
  }
}