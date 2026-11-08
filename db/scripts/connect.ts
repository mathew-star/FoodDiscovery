import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgAsyncDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool as PgPool } from 'pg';

export type ScriptDatabase = PgAsyncDatabase<PgQueryResultHKT>;

/** A pooled connection for CLI scripts (seed, backfills); not for app code, which uses db/client. */
export function connect(): { db: ScriptDatabase; close: () => Promise<void> } {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to seed');
  if ((process.env.DATABASE_DRIVER ?? 'neon') === 'pg') {
    const pool = new PgPool({ connectionString: url });
    return { db: drizzleNodePg({ client: pool }), close: () => pool.end() };
  }
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new NeonPool({ connectionString: url });
  return { db: drizzleNeon({ client: pool }), close: () => pool.end() };
}
