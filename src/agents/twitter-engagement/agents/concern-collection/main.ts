import { createConcernCollectionTool } from './tool';
import { z } from 'zod';
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { isDirectToConcernCollectionAgent } from "@/agents/twitter-engagement/predicate";

export async function concernCollectionAgent(
  state: typeof TwitterEngagementState.State
): Promise<typeof TwitterEngagementState.State> {
  const representativesList = state.engagementState.inputInfo?.bill?.cosponsors
    .map((rep, index) => `${index + 1}. ${rep.fullName} (${rep.state}, ${rep.party})`)
    .join('\n');

  try {
    if (isDirectToConcernCollectionAgent(state)) {
      const isFirstMessage = state.messages.length === 0

      const concernCollection = createConcernCollectionTool();
      const result = await concernCollection.invoke({
        input: state.engagementState.inputInfo.prompt,
        chat_history: state.messages
      });

      let updatedState: typeof TwitterEngagementState.State;
      if (result && !isFirstMessage) {
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
              agentMessage: `Guide the user through understanding the bill and express their concerns.

              CONTEXT - BILL INFORMATION:
              Bill ID: ${state.engagementState.inputInfo.bill?.id}
              Summary: ${state.engagementState.inputInfo.bill?.summary}
              
              DIRECTIVE:
              1. Present the bill information clearly
              2. Help user understand key points and potential impacts
              3. Guide them to articulate their specific concerns
              4. Ask about what changes they'd like to see
              
              Do not proceed to tweet suggestions until you have a clear understanding of their concerns. Focus on engaging in a meaningful discussion about the bill and its implications.
              ****this will help the user come up with tweet suggestions*****
              `
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