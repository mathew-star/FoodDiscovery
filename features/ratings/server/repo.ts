import 'server-only';

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { rankingConfig } from '@/db/schema';

export async function findRankingConfigValue(key: string): Promise<unknown> {
  const [row] = await getDb()
    .select({ value: rankingConfig.value })
    .from(rankingConfig)
    .where(eq(rankingConfig.key, key));
  return row?.value;
}
