import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import type { z } from 'zod';
import { logger } from '@/infra/logger';
import {
  rankingConfigDefaults,
  rankingConfigSchemas,
  type RankingConfigKey,
} from '../schemas/ranking-config';
import { findRankingConfigValue } from '../server/repo';

export async function getRankingConfig<K extends RankingConfigKey>(
  key: K,
): Promise<z.infer<(typeof rankingConfigSchemas)[K]>> {
  'use cache';
  cacheLife('config');
  cacheTag('ranking-config', `ranking-config:${key}`);
  const parsed = rankingConfigSchemas[key].safeParse(await findRankingConfigValue(key));
  if (parsed.success) return parsed.data as z.infer<(typeof rankingConfigSchemas)[K]>;
  logger.warn({ key }, 'ranking_config missing or invalid; using defaults');
  return rankingConfigDefaults[key] as z.infer<(typeof rankingConfigSchemas)[K]>;
}
