import 'server-only';

import { getDb } from '@/db/client';
import { listRatedBranches } from '../server/repo';

/** Places a member has rated; personal and request-time, so not cached. */
export async function getRatedBranches(userId: string) {
  return listRatedBranches(getDb(), userId);
}
