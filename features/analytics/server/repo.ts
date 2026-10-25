import 'server-only';

import { getDb } from '@/db/client';
import { analyticsEvents } from '@/db/schema';
import type { AnalyticsRow } from '../lib/rows';

export async function insertAnalyticsEvents(rows: AnalyticsRow[]): Promise<void> {
  if (rows.length === 0) return;
  await getDb().insert(analyticsEvents).values(rows);
}
