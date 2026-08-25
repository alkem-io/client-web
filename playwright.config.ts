import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the 006-collab-content-unification acceptance matrix
 * (quickstart.md SC-001). These run against the real, deployed full stack — the
 * unified collaboration-service, server BFF, and file-service — driving the
 * actual UI. They are NOT part of `pnpm test` (vitest); this is the orchestrator's
 * final gate, executed after every repo's slice deploys.
 *
 * Required env (see e2e/README.md):
 *   ALKEMIO_BASE_URL            (default http://localhost:3000)
 *   AUTH_TEST_HARNESS_EMAIL     primary account
 *   AUTH_TEST_HARNESS_EMAIL_2   second account (multi-user rows)
 *   AUTH_TEST_HARNESS_PASSWORD  shared password
 */
export default defineConfig({
  testDir: './e2e/specs',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: false, // collab rows mutate shared documents; keep deterministic
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.ALKEMIO_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: process.env.UI_HEADLESS !== 'false',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
