import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.STARTUP_CHECKS === '1') {
    const { registerServer } = await import('./infra/startup');
    await registerServer();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { logger, toLoggedError } = await import('./infra/logger');
  const digest =
    error instanceof Error && 'digest' in error && typeof error.digest === 'string'
      ? error.digest
      : undefined;

  logger.error(
    {
      error: toLoggedError(error),
      method: request.method,
      route: context.routePath,
      routeType: context.routeType,
      digest,
    },
    'Unhandled server request error',
  );
};
