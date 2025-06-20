import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import env from './env';

// Create a PostgreSQL client
const client = postgres(env.DATABASE_URL, {
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Max idle time in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create a Drizzle instance with the PostgreSQL client and schema
const db = drizzle(client, { schema });

// Export the database instance and client for potential direct usage
export { db, client };

// Function to close the database connection
export async function closeDatabaseConnection() {
  await client.end();
  console.log('Database connection closed');
}

// Handle process termination to close database connections
process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

// Export a function to check database connection
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, message: 'Database connection failed', error };
  }
}

// Export a transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  });
}
