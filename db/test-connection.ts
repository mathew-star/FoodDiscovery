import 'dotenv/config';

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to test the database connection');
}

const db = drizzle(databaseUrl);

async function testConnection(): Promise<void> {
  const result = await db.execute(sql`SELECT 1 + 1 AS sum`);
  console.log('Database connected:', result.rows);
}

testConnection().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Database connection failed:', message);
  process.exitCode = 1;
});
