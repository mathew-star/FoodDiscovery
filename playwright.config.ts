import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 3100);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
export const emailOutboxDir = path.join(process.cwd(), '.email-outbox', 'e2e');

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `bun run start -- --port ${port}`,
    url: `http://localhost:${port}/hyderabad`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Test-only auth settings; emails land in a folder the specs read instead of being sent.
    env: {
      BETTER_AUTH_URL: `http://localhost:${port}`,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'e2e-only-secret-not-used-anywhere-else-0000',
      EMAIL_OUTBOX_DIR: emailOutboxDir,
    },
  },
});
