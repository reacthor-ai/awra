import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { TwitterEngagementState } from "@/agents/twitter-engagement/state";
import { concernCollectionAgent } from "@/agents/twitter-engagement/agents/concern-collection/main";
import { representativeSelectionAgent } from "@/agents/twitter-engagement/agents/cosponsor-analysis/main";
import { tweetCompositionAgent } from "@/agents/twitter-engagement/agents/tweet-post/main";
import {
  shouldDirectToTweetSuggestions,
  shouldFinishTweetProcess,
  shouldProceedToComposition,
  shouldProceedToCosponsors
} from "@/agents/twitter-engagement/conditions";
import { BillAnalysisState } from "@/agents/bill/state";
import { tweetSuggestionAgent } from "@/agents/twitter-engagement/agents/tweet-generation/main";

export async function createTwitterEngagementWorkflow() {
  const checkpointer = new MemorySaver();
  const workflow = new StateGraph(TwitterEngagementState);

  // Add all nodes
  workflow
    .addNode("collect_concern", concernCollectionAgent)
    .addNode("analyze_cosponsors", representativeSelectionAgent)
    .addNode("suggest_tweets", tweetSuggestionAgent)
    .addNode("compose_tweet", tweetCompositionAgent)

    .addEdge(START, "collect_concern")

    .addConditionalEdges(
      "collect_concern",
      shouldProceedToCosponsors,
      {
        analyze_cosponsors: "analyze_cosponsors",
        [END]: END
      }
    )

    .addConditionalEdges(
      "analyze_cosponsors",
      shouldDirectToTweetSuggestions,
      {
        suggest_tweets: "suggest_tweets",
        [END]: END
      }
    )

    .addConditionalEdges(
      "suggest_tweets",
      shouldProceedToComposition,
      {
        suggest_tweets: "suggest_tweets",
        compose_tweet: "compose_tweet",
        [END]: END
      }
    )

    .addConditionalEdges(
      "compose_tweet",
      shouldFinishTweetProcess,
      {
        compose_tweet: "compose_tweet",
        suggest_tweets: "suggest_tweets",
        [END]: END
      }
    );

  return workflow.compile({
    checkpointer
  })
}

type TwitterEngagementWorkflowParams = {
  sessionId: string
  state: typeof BillAnalysisState.State
}

export async function twitterEngagementAgent(params: TwitterEngagementWorkflowParams) {
  const {
    sessionId,
    state,
  } = params
  const workflow = await createTwitterEngagementWorkflow();

  let initialState: typeof TwitterEngagementState.State

  initialState = {
    messages: state.messages,
    engagementState: {
      inputInfo: {
        prompt: state.analysisState.prompt,
        userId: state.analysisState.userId,
        chatId: state.analysisState.chatId,
        bill: {
          id: state.analysisState.mainBill.billNumber,
          summary: state.analysisState.mainBill.summary,
          cosponsors: state.analysisState.cosponsors,
        },
      },

      concernCollection: {
        userConcern: null
      },
      cosponsorsSelection: {
        selectedRepresentative: null,
        userVerifiedRepresentative: false,
      },
      processManagement: {
        status: 'init',
        error: null,
        retryCount: 0,
      },
      tweetTracker: {
        state: null
      },
      post: {
        tweet: null,
      },
      context: {
        agentMessage: "We're at the beginning stages collecting the users concerns / what they want to post."
      },
      completed: false,
      lastInteractionTime: null,
    }
  } satisfies typeof TwitterEngagementState.State

  if (state && state.analysisState.twitter) {
    initialState = {
      ...state,
      engagementState: {
        ...state.analysisState.twitter,
        inputInfo: {
          ...state.analysisState.twitter.inputInfo,
          prompt: state.analysisState.prompt,
        }
      }
    }
  }
  return workflow.invoke(initialState, {
    configurable: {
      thread_id: sessionId
    }
  });
}