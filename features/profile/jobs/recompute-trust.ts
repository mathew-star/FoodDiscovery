import 'server-only';

import { inngest, jobEvents } from '@/infra/inngest/client';
import { recomputeTrustLevels } from '../server/service';

/** Spec §2.2 nightly at 03:00 IST; then the full score recompute picks up the new levels (D46). */
export const recomputeTrust = inngest.createFunction(
  { id: 'profile-recompute-trust', triggers: [{ cron: 'TZ=Asia/Kolkata 0 3 * * *' }] },
  async ({ step }) => {
    const result = await step.run('recompute-trust-levels', () => recomputeTrustLevels());
    await step.sendEvent('recompute-scores', { name: jobEvents.recomputeScores, data: {} });
    return result;
  },
);
