import 'server-only';

import { ensureDefaultLists, listMemberLists } from '../server/repo';

/** A member's lists for /saved. Personal and request-time, so not cached. */
export async function getMemberLists(userId: string) {
  await ensureDefaultLists(userId);
  return listMemberLists(userId);
}

export type MemberList = Awaited<ReturnType<typeof getMemberLists>>[number];
