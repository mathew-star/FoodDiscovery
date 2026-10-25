import { createAuthClient } from 'better-auth/react';

/** Same-origin client for the /api/auth endpoints; used only by the auth forms. */
export const authClient = createAuthClient({ basePath: '/api/auth' });
