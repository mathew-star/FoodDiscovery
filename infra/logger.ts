import 'server-only';

import pino from 'pino';
import { ConfigurationError } from './env';

const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
const configuredLevel = process.env.LOG_LEVEL;
const level = levels.find((candidate) => candidate === configuredLevel) ?? 'info';

export const logger = pino({
  name: 'dish-app',
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      '*.password',
      '*.token',
      '*.accessKeyId',
      '*.secretAccessKey',
      '*.authorization',
      '*.DATABASE_URL',
      '*.REDIS_URL',
    ],
    censor: '[REDACTED]',
  },
});

type LoggedError = {
  name: string;
  code?: string;
  statusCode?: number;
  message?: string;
  cause?: LoggedError;
  errors?: LoggedError[];
};

function redactMessage(message: string): string {
  let safeMessage = message;

  for (const name of ['DATABASE_URL', 'REDIS_URL', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY']) {
    const secret = process.env[name];
    if (secret) {
      safeMessage = safeMessage.replaceAll(secret, '[REDACTED]');
    }
  }

  return safeMessage.replace(/\b(?:postgres(?:ql)?|rediss?):\/\/\S+/gi, '[REDACTED_URL]').slice(0, 300);
}

export function toLoggedError(error: unknown, includeMessage = false, depth = 0): LoggedError {
  if (!(error instanceof Error)) {
    return { name: 'UnknownError' };
  }

  const details = error as Error & {
    code?: unknown;
    statusCode?: unknown;
    sourceError?: unknown;
    $metadata?: { httpStatusCode?: unknown };
  };
  const code =
    typeof details.code === 'string' && /^[A-Za-z0-9_]{1,80}$/.test(details.code) ? details.code : undefined;
  const statusCode = details.statusCode ?? details.$metadata?.httpStatusCode;
  const sourceError = error.cause ?? details.sourceError;
  const cause =
    depth < 3 && sourceError !== undefined
      ? toLoggedError(sourceError, includeMessage, depth + 1)
      : undefined;
  const errors =
    depth < 3 && error instanceof AggregateError
      ? error.errors.slice(0, 3).map((item: unknown) => toLoggedError(item, includeMessage, depth + 1))
      : undefined;

  return {
    name: /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(error.name) ? error.name : 'Error',
    ...(code ? { code } : {}),
    ...(typeof statusCode === 'number' ? { statusCode } : {}),
    ...(includeMessage || error instanceof ConfigurationError
      ? { message: redactMessage(error.message) }
      : {}),
    ...(cause ? { cause } : {}),
    ...(errors?.length ? { errors } : {}),
  };
}
