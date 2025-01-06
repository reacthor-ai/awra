import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from 'pg';

export type CheckpointerConfig = {
  loggedIn: boolean;
  postgresUrl: string;
}

export async function createCheckpointer(config: CheckpointerConfig) {
  try {
    const isDev = process.env.NODE_ENV === 'development'
    const cert = process.env.CA_CERTIFICATE;

    if (isDev) {
      const pool = new Pool({
        connectionString: config.postgresUrl,
        ssl: cert ? {
          rejectUnauthorized: true,
          ca: cert
        } : {
          rejectUnauthorized: true
        },
        max: 20, // maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });

      const checkpointer = new PostgresSaver(pool);
      await checkpointer.setup();

      return checkpointer;
    }

    const checkpointer = PostgresSaver.fromConnString(config.postgresUrl);
    await checkpointer.setup();

    return checkpointer;
  } catch (error) {
    console.error("Failed to create or set up the checkpointer:", error);
    throw new Error("Checkpointer setup failed. Please verify the database connection and configuration.");
  }
}