export type AppErrorCode =
  'unauthenticated' | 'forbidden' | 'invalid_input' | 'not_found' | 'conflict' | 'rate_limited' | 'internal';

export type AppError = {
  code: AppErrorCode;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

export type Result<T, E = AppError> = { ok: true; data: T } | { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}
