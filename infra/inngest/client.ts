import 'server-only';

import { Inngest } from 'inngest';

/**
 * One client for the app. Keys come from INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY in production;
 * locally `INNGEST_DEV=1` points it at the Inngest dev server (`bun run inngest:dev`).
 */
export const inngest = new Inngest({ id: 'fdn' });

export const jobEvents = {
  recomputeScores: 'ratings/recompute-all',
} as const;
