import { createConcernCollectionTool } from './tool';
import { z } from 'zod';
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { isDirectToConcernCollectionAgent } from "@/agents/twitter-engagement/predicate";

export async function concernCollectionAgent(
  state: typeof TwitterEngagementState.State
): Promise<typeof TwitterEngagementState.State> {
  const representativesList = state.engagementState.inputInfo?.bill?.cosponsors
    .map((rep, index) => `${index + 1}. ${rep.fullName} (${rep.state}, ${rep.party})`)
    .join('\n');'.'

  try {
    if (isDirectToConcernCollectionAgent(state)) {
      const concernCollection = createConcernCollectionTool();
      const result = await concernCollection.invoke({
        input: state.engagementState.inputInfo.prompt,
        chat_history: state.messages
      });

      let updatedState: typeof TwitterEngagementState.State;

      if (result) {
        updatedState = {
          ...state,
          engagementState: {
            ...state.engagementState,
            concernCollection: {
              userConcern: result,
            },
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'awaiting_representative_selection',
            },
            context: {
              agentMessage: `
                We've successfully collected their concern / what they want to tweet, here the details:  
                ${result}, we should clarify if needed otherwise, lets move on.
                Now they need to select their representatives from the list:
                ${representativesList}
              `
            },
            lastInteractionTime: new Date().toISOString()
          },
          messages: state.messages
        };
      } else {
        updatedState = {
          ...state,
          engagementState: {
            ...state.engagementState,
            processManagement: {
              ...state.engagementState.processManagement,
              status: 'init',
            },
            context: {
              agentMessage: "There was an issue updating the concerns of the users we'll have to try again."
            }
          },
          messages: state.messages
        };
      }

      return updatedState
    }

    return state

  } catch (error: any) {
    console.error("Error in concern collection agent:", error);

    if (error instanceof z.ZodError) {
      return {
        ...state,
        engagementState: {
          ...state.engagementState,
          processManagement: {
            ...state.engagementState.processManagement,
            status: 'init',
            error: "Invalid state update: " + JSON.stringify(error.errors)
          },
          context: {
            agentMessage: `There's an internal error when we try to collect the users concern, communicate to
          the user an appropriate message
          `
          }
        },
        messages: state.messages
      };
    }

    return {
      ...state,
      engagementState: {
        ...state.engagementState,
        processManagement: {
          ...state.engagementState.processManagement,
          status: 'init',
          error: error.message
        },
        context: {
          agentMessage: `There's an internal error when we try to collect the users concern, communicate to
          the user an appropriate message
          `
        }
      },
      messages: state.messages
    };
  }
}