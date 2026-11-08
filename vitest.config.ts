import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'tests/e2e/**', '.next/**'],
    environment: 'node',
    // Integration suites share one seeded database (a full recompute in one would race another's
    // assertions), so files run one at a time whenever a database is configured.
    fileParallelism: process.env.DATABASE_DRIVER !== 'pg',
    env: loadEnv('test', process.cwd(), ''),
  },
});
