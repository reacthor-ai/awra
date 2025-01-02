import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { BaseCheckpointSaver, CheckpointMetadata, CheckpointTuple } from "@langchain/langgraph";
import Dexie from "dexie";
import { RunnableConfig } from "@langchain/core/runnables";
import { ChannelVersions, CheckpointListOptions, PendingWrite } from "@langchain/langgraph-checkpoint";

export interface CheckpointerConfig {
  loggedIn: boolean;
  postgresUrl?: string;
  sqlitePath?: string;
}

class BillAnalysisDB extends Dexie {
  conversations!: Dexie.Table<{
    id: string;
    state: any;
    timestamp: Date;
    writes?: PendingWrite[];
  }, string>;

  constructor() {
    super("BillAnalysisDB");
    this.version(1).stores({
      conversations: "id, timestamp"
    });

    // Assign the table
    this.conversations = this.table("conversations");
  }
}

export class BrowserMemorySaver extends BaseCheckpointSaver {
  private db: BillAnalysisDB;

  constructor() {
    super();
    this.db = new BillAnalysisDB();
  }

  async get(config: { configurable?: { sessionId?: string } }) {
    try {
      const sessionId = config.configurable?.sessionId;
      if (!sessionId) return undefined;

      const conversation = await this.db.conversations
        .where("id")
        .equals(sessionId)
        .first();

      return conversation?.state;
    } catch (error) {
      console.error("Error retrieving state:", error);
      return undefined;
    }
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    try {
      const sessionId = config.configurable?.sessionId;
      if (!sessionId) return undefined;

      const conversation = await this.db.conversations
        .where("id")
        .equals(sessionId)
        .first();

      if (!conversation) return undefined;

      return {
        checkpoint: conversation.state,
        config: {}
      };
    } catch (error) {
      console.error("Error retrieving tuple:", error);
      return undefined;
    }
  }

  async* list(
    config: RunnableConfig,
    options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    try {
      const sessionId = config.configurable?.sessionId;
      if (!sessionId) return;

      // Get all conversations
      let query = this.db.conversations;

      const conversations = await query.toArray();

      for (const conversation of conversations) {
        yield {
          checkpoint: conversation.state,
          config: {}
        };
      }
    } catch (error) {
      console.error("Error listing checkpoints:", error);
    }
  }

  async put(
    config: { configurable?: { sessionId?: string } },
    checkpoint: any,
    metadata: CheckpointMetadata,
    newVersions: ChannelVersions
  ) {
    try {
      const sessionId = config.configurable?.sessionId;
      if (!sessionId) return config;

      await this.db.conversations.put({
        id: sessionId,
        state: checkpoint,
        timestamp: new Date(),
        // Store versions if needed
      });

      return config;
    } catch (error) {
      console.error("Error saving state:", error);
      return config;
    }
  }

  async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    try {
      const sessionId = config.configurable?.sessionId;
      if (!sessionId) return;

      const conversation = await this.db.conversations
        .where("id")
        .equals(sessionId)
        .first();

      if (conversation) {
        // Append or update writes for this conversation
        await this.db.conversations.put({
          ...conversation,
          writes: [...(conversation.writes || []), ...writes]
        });
      }
    } catch (error) {
      console.error("Error saving writes:", error);
    }
  }

  // Helper methods
  async clearOldSessions(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.db.conversations
      .where("timestamp")
      .below(cutoffDate)
      .delete();
  }

  async getAllSessions() {
    return this.db.conversations.toArray();
  }

  async deleteSession(sessionId: string) {
    await this.db.conversations
      .where("id")
      .equals(sessionId)
      .delete();
  }
}

export async function createCheckpointer(config: CheckpointerConfig) {
  if (config.loggedIn && config.postgresUrl) {
    // Use Postgres for logged-in users
    const checkpointer = PostgresSaver.fromConnString(config.postgresUrl);
    await checkpointer.setup();
    return checkpointer;
  } else {
    const memory = new BrowserMemorySaver();
    const newe = memory.get({ configurable: { sessionId: 'user?.id' } })
    memory.put('', { configurable: { sessionId: 'user?.id' } })
    console.log({memory: newe})
    return memory
  }
}