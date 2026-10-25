import 'server-only';

import { usernameBase } from '../lib/username';
import { isUsernameTaken } from '../server/repo';

/** A free username to prefill onboarding; empty when five tries collide (the member then types one). */
export async function getUsernameSuggestion(displayName: string): Promise<string> {
  const base = usernameBase(displayName);
  if (!(await isUsernameTaken(base))) return base;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${base.slice(0, 16)}_${Math.floor(100 + Math.random() * 900)}`;
    if (!(await isUsernameTaken(candidate))) return candidate;
  }
  return '';
}
