import 'server-only';

import { cache } from 'react';
import { getSession } from '@/features/auth/queries/session';
import { findProfile } from '../server/repo';

/** The signed-in member with their profile (null profile = onboarding not finished). Request-time. */
export const getViewer = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return { ...session, profile: await findProfile(session.userId) };
});

export type Viewer = NonNullable<Awaited<ReturnType<typeof getViewer>>>;
