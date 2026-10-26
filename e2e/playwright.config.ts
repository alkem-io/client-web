import { defineConfig, devices } from '@playwright/test';

/**
 * Standalone Playwright config for the live-stack E2E walks under `e2e/`.
 * Not part of CI and never part of `pnpm test` (vitest excludes `e2e/**`).
 *
 * Two spellings of a live walk live side by side and both are discovered here:
 *   - `*.e2e.ts` — the feature-013 conversation-attachment walk (see
 *     `conversationAttachments.e2e.ts` for its prerequisites: running app + backend,
 *     a member session, and a conversation whose `Conversation.storageBucket` is
 *     non-null — that bucket, not any platform feature flag, exposes the attach
 *     affordance);
 *   - `specs/*.e2e.spec.ts` — the acceptance walks that the root
 *     `playwright.config.ts` also runs (`pnpm test:e2e`).
 *
 * The base URL honours `ALKEMIO_BASE_URL` as well, the variable the fixtures and the
 * root config read, so one environment drives the config and the walks alike.
 *
 * Run: `pnpm exec playwright test -c e2e/playwright.config.ts [files...]`
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.{ts,spec.ts}',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? process.env.ALKEMIO_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    storageState: process.env.E2E_STORAGE_STATE,
    launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
