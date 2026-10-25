import 'server-only';

import { getAuth } from './auth';

/** Better Auth's endpoints under /api/auth (ARCHITECTURE §5). */
export function handleAuthRequest(request: Request): Promise<Response> {
  return getAuth().handler(request);
}
