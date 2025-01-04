import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from 'pg';

export type CheckpointerConfig = {
  loggedIn: boolean;
  postgresUrl: string;
}

export async function createCheckpointer(config: CheckpointerConfig) {
  try {
    const cert = process.env.CA_CERTIFICATE;
    const pool = new Pool({
      connectionString: config.postgresUrl,
      ssl: cert ? {
        rejectUnauthorized: true,
        ca: cert
      } : {
        rejectUnauthorized: true
      }
    });

    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();

    return checkpointer;
  } catch (error) {
    console.error("Failed to create or set up the checkpointer:", error);
    throw new Error("Checkpointer setup failed. Please verify the database connection and configuration.");
  }
}
