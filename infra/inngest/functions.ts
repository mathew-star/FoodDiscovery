import 'server-only';

import { recomputeTrust } from '@/features/profile/jobs/recompute-trust';
import { recomputeAll } from '@/features/ratings/jobs/recompute-all';

/** Every Inngest function the app serves (AGENTS: register jobs here). */
export const functions = [recomputeTrust, recomputeAll];
