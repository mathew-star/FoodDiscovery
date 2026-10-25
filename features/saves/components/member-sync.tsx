import { getSession } from '@/features/auth/queries/session';
import { MemberSyncClient } from './member-sync.client';

/** Header slot (inside <Suspense>): turns Save buttons into account saves for members. */
export async function MemberSync() {
  return (await getSession()) ? <MemberSyncClient /> : null;
}
