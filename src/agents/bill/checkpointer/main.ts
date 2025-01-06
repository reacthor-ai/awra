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
      },
      // Add connection pool settings
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Add error handler for the pool
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });

    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();

    return checkpointer;
  } catch (error) {
    console.error("Failed to create or set up the checkpointer:", error);
    throw new Error("Checkpointer setup failed. Please verify the database connection and configuration.");
  }
}