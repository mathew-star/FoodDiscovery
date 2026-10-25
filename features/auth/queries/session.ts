import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';
import { logger } from '@/infra/logger';
import { getAuth } from '../server/auth';

/**
 * The signed-in member for this request, or null. Request-time (reads cookies), so callers render
 * inside <Suspense>; deduplicated per request.
 */
export const getSession = cache(async () => {
  const requestHeaders = await headers();
  try {
    const session = await getAuth().api.getSession({ headers: requestHeaders });
    return session ? { userId: session.user.id, email: session.user.email, name: session.user.name } : null;
  } catch (error) {
    // A misconfigured or unreachable auth backend must not take every page down; readers stay guests.
    logger.error({ err: error }, 'session lookup failed');
    return null;
  }
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>>;
