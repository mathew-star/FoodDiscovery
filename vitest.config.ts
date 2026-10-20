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
    env: loadEnv('test', process.cwd(), ''),
  },
});
