import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { must } from '../../shared/must';

const connectionString = must(process.env.PG_URL, "PG_URL environment variable is required for database connection");
const client = postgres(connectionString);
export const db = drizzle(client);