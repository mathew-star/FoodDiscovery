import 'server-only';

export class ConfigurationError extends Error {
  readonly code = 'CONFIG_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ConfigurationError(`Missing required environment variable: ${name}`);
  }

  return value;
}
