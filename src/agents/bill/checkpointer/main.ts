import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";

export type CheckpointerConfig = {
  loggedIn: boolean;
  postgresUrl: string;
}

export async function createCheckpointer(config: CheckpointerConfig) {
  try {
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev) {
      const checkpointer = PostgresSaver.fromConnString(process.env.PUBLIC_POSTGRES_URL!);
      await checkpointer.setup();

      return checkpointer;
    }

    const pool = new Pool({
      connectionString: config.postgresUrl,
      ssl: {
        rejectUnauthorized: false, // Required for DigitalOcean's self-signed cert
      },
    });

    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();

    return checkpointer;
  } catch (error) {
    console.error("Failed to create or set up the checkpointer:", error);
    throw new Error("Checkpointer setup failed. Please verify the database connection and configuration.");
  }
}