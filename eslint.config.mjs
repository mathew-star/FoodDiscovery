import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const featurePrivate = [
  '@/features/*/server/service',
  '@/features/*/server/repo',
  '@/features/*/server/permissions',
  '@/features/*/jobs/*',
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': ['error', { allow: ['error'] }],
    },
  },
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/db/*', '@/infra/*', 'drizzle-orm', 'drizzle-orm/*'],
              message: 'app/ is routing only; go through a feature query or action.',
            },
            {
              group: featurePrivate,
              message: 'Import a feature only through components, queries, schemas, hooks or server/actions.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: featurePrivate,
              message:
                'Use relative imports inside a feature; other features expose only their public surface.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/db/*', '@/infra/*'],
              message: 'shared/ must not depend on features, db or infra.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.client.tsx', '**/hooks/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/db/*',
                '@/infra/*',
                '@/features/*/server/*',
                '!@/features/*/server/actions',
                '@/features/*/queries/*',
              ],
              message: 'Client code cannot import server modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['db/test-connection.ts', 'db/seed/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/sw.js',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
