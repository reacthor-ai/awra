import { z } from 'zod';
import { createSelectionTool } from "./tool";
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { isDirectToGeneralPost } from "@/agents/twitter-engagement/predicate";

export async function representativeSelectionAgent(state: typeof TwitterEngagementState.State): Promise<typeof TwitterEngagementState.State> {
  if (!state.engagementState.concernCollection.userConcern) {
    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        processManagement: {
          ...state.engagementState.processManagement,
          status: 'awaiting_representative_selection'
        }
      }
    };
  }

  const representativesList = state.engagementState.inputInfo?.bill?.cosponsors
    .map((rep, index) => `${index + 1}. ${rep.fullName} (${rep.state}, ${rep.party})`)
    .join('\n');'.'
  try {
    if (state.engagementState.processManagement.status === 'awaiting_representative_selection') {
      const selectionTool = createSelectionTool();
      const selectionResult = await selectionTool.invoke({
        userResponse: state.engagementState.inputInfo.prompt,
        cosponsors: state.engagementState.inputInfo.bill?.cosponsors || []
      });

      if (
        !selectionResult.isValid &&
        state.engagementState.inputInfo.bill &&
        state.engagementState.inputInfo.bill?.cosponsors?.length > 0 // if we have co-sponsors
      ) {
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            cosponsorsSelection: {
              selectedRepresentative: null,
              userVerifiedRepresentative: false,
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'generating_tweet_suggestions'
            },
            context: {
              agentMessage: `There was an issue when selecting a representative, if they don't want to choose 
              a representative they can just put: 0 or just say it or choose from the list of representatives:
               ${representativesList}
              `
            }
          }
        }
      }
      return {
        ...state,
        engagementState: {
          ...state.engagementState,
          cosponsorsSelection: {
            selectedRepresentative: selectionResult.selectedRepresentative,
            userVerifiedRepresentative: true,
          },
          processManagement: {
            ...state.engagementState.processManagement,
            status: 'generating_tweet_suggestions',
          },
          context: {
            agentMessage: `The user has successfully selected or not a representative, 
            message: ${selectionResult.message}, representative: ${selectionResult.selectedRepresentative}
            if they didn't that's okay. Just thank them for confirming the representative or not.
            Follow up by asking questions related to what they'd like to generate the tweet about. Based on their 
            user concern: ${state.engagementState.concernCollection?.userConcern}
            `
          }
        }
      };
    }

    // If we're already verified or ready for general post, pass through
    if (isDirectToGeneralPost(state)) {
      return state;
    }

    // Default case: waiting for user input
    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        context: {
          agentMessage: `The user most likely did not choose a representative help them choose one from the list:
          ${representativesList}
        `
        }
      }
    }

  } catch (error: any) {
    console.error("Error in representative selection agent:", error);
    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        processManagement: {
          ...state.engagementState.processManagement,
          status: 'awaiting_representative_selection',
          error: error instanceof z.ZodError ?
            "Invalid state update: " + JSON.stringify(error.errors) :
            error.message
        },
        context: {
          agentMessage: "There's an internal issue tell the user to try again.",
        }
      }
    };
  }
}