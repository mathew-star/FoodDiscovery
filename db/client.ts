import 'server-only';

import { neon, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import { requireEnv } from '@/infra/env';

const databaseUrl = requireEnv('DATABASE_URL');

export const db = drizzleHttp({ client: neon(databaseUrl) });

type PoolDatabase = ReturnType<typeof drizzlePool<Record<string, never>, Pool>>;
type Transaction = Parameters<Parameters<PoolDatabase['transaction']>[0]>[0];

const globalForDb = globalThis as typeof globalThis & { fdnPoolDb?: PoolDatabase };

function getPoolDb(): PoolDatabase {
  globalForDb.fdnPoolDb ??= drizzlePool({ client: new Pool({ connectionString: databaseUrl }) });
  return globalForDb.fdnPoolDb;
}

export function withTransaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
  return getPoolDb().transaction(work);
}
