import { t, type MessageKey } from '@/i18n';

const known: Record<string, MessageKey> = {
  INVALID_EMAIL_OR_PASSWORD: 'auth.errors.invalidCredentials',
  INVALID_EMAIL: 'auth.errors.invalidEmail',
  EMAIL_NOT_VERIFIED: 'auth.errors.notVerified',
  USER_ALREADY_EXISTS: 'auth.errors.exists',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'auth.errors.exists',
  PASSWORD_TOO_SHORT: 'auth.errors.password.too_short',
  PASSWORD_TOO_LONG: 'auth.errors.password.too_long',
  INVALID_TOKEN: 'auth.errors.invalidToken',
};

/**
 * Text for a Better Auth client error. Server-built messages (rate limits, weak passwords) are
 * already in our copy, so they pass through; anything unknown gets a generic line.
 */
export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null) {
  if (!error) return null;
  if (error.code === 'RATE_LIMITED' || error.code === 'WEAK_PASSWORD')
    return error.message ?? t('auth.errors.generic');
  if (error.status === 429) return t('auth.errors.rateLimited');
  const key = error.code ? known[error.code] : undefined;
  return key ? t(key) : t('auth.errors.generic');
}
