import 'server-only';

import { revalidateTag } from 'next/cache';
import { inngest, jobEvents } from '@/infra/inngest/client';
import { recomputeAllScores } from '../server/service';

/** D46: rebuild every dish and branch score; one run at a time, retried on failure. */
export const recomputeAll = inngest.createFunction(
  {
    id: 'ratings-recompute-all',
    triggers: [{ event: jobEvents.recomputeScores }],
    concurrency: { limit: 1 },
    retries: 2,
  },
  async ({ step }) => {
    const result = await step.run('recompute-scores', () => recomputeAllScores());
    await step.run('refresh-pages', () => {
      // Stale-while-revalidate: pages keep serving while fresh scores are fetched.
      for (const tag of ['branch-dishes', 'branches', 'search']) revalidateTag(tag, 'max');
    });
    return result;
  },
);
