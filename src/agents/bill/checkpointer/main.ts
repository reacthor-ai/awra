import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

export interface CheckpointerConfig {
  loggedIn: boolean;
  postgresUrl: string;
}

export async function createCheckpointer(config: CheckpointerConfig) {
  try {
    const checkpointer = PostgresSaver.fromConnString(config.postgresUrl);
    await checkpointer.setup();
    return checkpointer;
  } catch (error) {
    console.error("Failed to create or set up the checkpointer:", error);
    throw new Error("Checkpointer setup failed. Please verify the database connection and configuration.");
  }
}
