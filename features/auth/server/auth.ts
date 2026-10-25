import 'server-only';

import { createHash } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { getWriteDb } from '@/db/client';
import { accounts, sessions, users, verifications } from '@/db/schema';
import { clientIpKey } from '@/infra/client-ip';
import { sendEmail } from '@/infra/email';
import { requireEnv } from '@/infra/env';
import { limit, type RateLimitPolicy } from '@/infra/ratelimit';
import { t } from '@/i18n';
import { uuidv7 } from '@/shared/lib/uuid';
import { resetPasswordEmail, verificationEmail } from '../emails/action-email';
import { checkPassword, passwordMaxLength, passwordMinLength } from '../lib/password-policy';

const MINUTE = 60_000;
const linkLifetimeSeconds = 30 * 60;

// D2. Sign-in counts attempts, not only failures: the limiter cannot tell them apart before the check.
const policies = {
  signInEmail: { name: 'auth:sign-in:email', limit: 5, windowMs: 15 * MINUTE },
  signInIp: { name: 'auth:sign-in:ip', limit: 20, windowMs: 60 * MINUTE },
  emailSend: { name: 'auth:email-send:email', limit: 3, windowMs: 15 * MINUTE },
  anyIp: { name: 'auth:ip', limit: 60, windowMs: MINUTE },
} satisfies Record<string, RateLimitPolicy>;

const emailKey = (email: unknown) =>
  createHash('sha256')
    .update(
      String(email ?? '')
        .trim()
        .toLowerCase(),
    )
    .digest('hex')
    .slice(0, 32);

async function enforce(policy: RateLimitPolicy, identifier: string) {
  const decision = await limit(policy, identifier);
  if (!decision.allowed) {
    const retryAfter = Math.ceil(decision.retryAfterMs / 1000);
    throw new APIError(
      'TOO_MANY_REQUESTS',
      { code: 'RATE_LIMITED', message: t('auth.errors.rateLimited'), retryAfter },
      { 'Retry-After': String(retryAfter) },
    );
  }
}

function weakPassword(password: unknown, email: unknown) {
  const problem = typeof password === 'string' ? checkPassword(password, String(email ?? '')) : 'too_short';
  if (problem) {
    throw new APIError('BAD_REQUEST', {
      code: 'WEAK_PASSWORD',
      message: t(`auth.errors.password.${problem}`),
    });
  }
}

type Body = Record<string, unknown>;

const limitedPaths = new Set([
  '/sign-up/email',
  '/sign-in/email',
  '/reset-password',
  '/request-password-reset',
  '/send-verification-email',
]);

/** Spec E1-2 as D1/D2, E1-5 sessions. Built lazily so builds and tests never need auth env. */
function createAuth() {
  return betterAuth({
    appName: t('app.name'),
    baseURL: requireEnv('BETTER_AUTH_URL'),
    basePath: '/api/auth',
    secret: requireEnv('BETTER_AUTH_SECRET'),
    database: drizzleAdapter(getWriteDb(), {
      provider: 'pg',
      usePlural: true,
      transaction: true,
      schema: { users, sessions, accounts, verifications },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: passwordMinLength,
      maxPasswordLength: passwordMaxLength,
      autoSignIn: false,
      resetPasswordTokenExpiresIn: linkLifetimeSeconds,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({ to: user.email, ...resetPasswordEmail(url) });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: linkLifetimeSeconds,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({ to: user.email, ...verificationEmail(url) });
      },
    },
    session: {
      expiresIn: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    },
    // Limits run in the hook below on the shared Redis limiter (D3, D33).
    rateLimit: { enabled: false },
    advanced: {
      cookiePrefix: 'fdn',
      database: { generateId: () => uuidv7() },
      ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] },
    },
    telemetry: { enabled: false },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Only the endpoints that create accounts, check passwords or send email are limited;
        // session reads stay free so rendering a page never touches the limiter.
        if (!limitedPaths.has(ctx.path)) return;
        const headers = ctx.headers ?? ctx.request?.headers ?? new Headers();
        const body = (ctx.body ?? {}) as Body;
        const ip = clientIpKey(headers);
        await enforce(policies.anyIp, ip);
        switch (ctx.path) {
          case '/sign-up/email':
            weakPassword(body.password, body.email);
            await enforce(policies.emailSend, emailKey(body.email));
            break;
          case '/sign-in/email':
            await enforce(policies.signInIp, ip);
            await enforce(policies.signInEmail, emailKey(body.email));
            break;
          case '/reset-password':
            weakPassword(body.newPassword, undefined);
            break;
          case '/request-password-reset':
          case '/send-verification-email':
            await enforce(policies.emailSend, emailKey(body.email));
            break;
        }
      }),
    },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as typeof globalThis & { fdnAuth?: Auth };

export function getAuth(): Auth {
  globalForAuth.fdnAuth ??= createAuth();
  return globalForAuth.fdnAuth;
}
