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
    .join('\n');
  try {
    if (state.engagementState.processManagement.status === 'awaiting_representative_selection') {
      const selectionTool = createSelectionTool();
      const selectionResult = await selectionTool.invoke({
        userResponse: state.engagementState.inputInfo.prompt,
        cosponsors: state.engagementState.inputInfo.bill?.cosponsors || []
      });
      if (selectionResult.type === 'retry') {
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
              status: 'awaiting_representative_selection',
            },
            context: {
              agentMessage: `The user made an invalid selection. They can either:
              1. Choose a representative from this list:
              ${representativesList}
              2. Enter '0' or say 'skip' to proceed without selecting a representative.
              Please make a valid selection.`
            }
          }
        };
      }

      if (selectionResult.type === 'skipped') {
        return {
          ...state,
          engagementState: {
            ...state.engagementState,
            cosponsorsSelection: {
              selectedRepresentative: null,
              userVerifiedRepresentative: true,
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'generating_tweet_suggestions',
            },
            context: {
              agentMessage: `The user has chosen to proceed without selecting a specific representative. 
              You should tailor the message for a general audience rather than a specific representative.`
            }
          }
        };
      }

      if (selectionResult.type === 'invalid') {
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
              status: 'awaiting_representative_selection'
            },
            context: {
              agentMessage: `I couldn't understand your selection. You have two options:
              1. Choose a representative by number from this list:
              ${representativesList}
              2. Enter '0' or say 'skip' if you don't want to select a specific representative.
              Please provide a clear response.
              reason: ${selectionResult.reasoning}
              `
            }
          }
        }
      }

      if (selectionResult.type === 'selected') {
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
              agentMessage: `The user has selected ${selectionResult.selectedRepresentative?.fullName} as their representative to contact. 
              You can proceed with generating the message for this specific representative.
              additional details: ${selectionResult.selectedRepresentative}
              `
            }
          }
        };
      }
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