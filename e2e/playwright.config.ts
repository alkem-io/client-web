import { defineConfig, devices } from '@playwright/test';

/**
 * Standalone Playwright config for feature-013 conversation-attachment E2E.
 * Not part of CI. See `conversationAttachments.e2e.ts` for the prerequisites
 * (running app + backend, a member session, and a conversation whose
 * `Conversation.storageBucket` is non-null — that bucket, not any platform
 * feature flag, is what exposes the attach affordance).
 *
 * Run: `pnpm exec playwright test -c e2e/playwright.config.ts`
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    storageState: process.env.E2E_STORAGE_STATE,
    launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
