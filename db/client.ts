import 'server-only';

import { neon, Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNeonPool } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgAsyncDatabase, PgAsyncTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool as PgPool } from 'pg';
import { ConfigurationError, requireEnv } from '@/infra/env';

export type Database = PgAsyncDatabase<PgQueryResultHKT>;
export type Transaction = PgAsyncTransaction<PgQueryResultHKT>;

type Clients = { reader: Database; writer: Database };

const globalForDb = globalThis as typeof globalThis & { fdnDb?: Clients };

function createClients(): Clients {
  const url = requireEnv('DATABASE_URL');
  const driver = process.env.DATABASE_DRIVER?.trim() || 'neon';

  if (driver === 'pg') {
    const pooled = drizzleNodePg({ client: new PgPool({ connectionString: url, max: 10 }) });
    return { reader: pooled, writer: pooled };
  }

  if (driver !== 'neon') {
    throw new ConfigurationError('DATABASE_DRIVER must be "neon" or "pg"');
  }

  return {
    reader: drizzleNeonHttp({ client: neon(url) }),
    writer: drizzleNeonPool({ client: new NeonPool({ connectionString: url }) }),
  };
}

function clients(): Clients {
  globalForDb.fdnDb ??= createClients();
  return globalForDb.fdnDb;
}

export function getDb(): Database {
  return clients().reader;
}

export function withTransaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
  return clients().writer.transaction(work);
}
