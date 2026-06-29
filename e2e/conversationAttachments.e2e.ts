import { expect, test } from '@playwright/test';

/**
 * E2E: conversation message attachments — attach → send → render (feature 013).
 *
 * STATUS: NOT RUN in this environment. Requires the full running stack and is
 * NOT wired into CI. To run it you need ALL of:
 *   1. `@playwright/test` installed (only the `playwright` core ships today):
 *        pnpm add -D @playwright/test && pnpm exec playwright install chromium
 *   2. The web app on http://localhost:3001 with the Alkemio backend on :3000
 *        (matrix-adapter + file-service + Synapse — the full conversation stack).
 *   3. The `ATTACHMENTS` platform feature flag enabled on the backend.
 *   4. The SERVER exposing the per-conversation storage bucket via GraphQL so the
 *        composer can resolve an upload target — see
 *        `src/main/crdPages/unifiedChat/attachments/useConversationStorageConfig.ts`.
 *        Until that field exists the composer's attach affordance stays inert and
 *        this spec will (correctly) not find the attach control.
 *   5. An authenticated session with at least one conversation, fixture image at
 *        `e2e/fixtures/photo.png`, and the env below.
 *
 * Run with: `pnpm exec playwright test -c e2e/playwright.config.ts`.
 *
 * The naming is intentional (`*.e2e.ts`, not `*.spec.ts`) so Vitest's default
 * `{test,spec}` glob does not pick it up.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const CONVERSATION_PATH = process.env.E2E_CONVERSATION_PATH; // e.g. open the messaging panel + a conversation

test.describe('conversation attachments', () => {
  test.skip(!CONVERSATION_PATH, 'Set E2E_CONVERSATION_PATH and run the full stack to enable.');

  test('a member can attach an image, send it, and see it rendered in the thread', async ({ page }) => {
    await page.goto(`${BASE_URL}${CONVERSATION_PATH}`);

    // Open the file chooser via the composer's attach button (aria-label from
    // crd-space `comments.attachments.attach`).
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /attach files/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('e2e/fixtures/photo.png');

    // The staged chip appears while uploading, then send becomes enabled once
    // the upload resolves (temporaryLocation document in the conversation bucket).
    await expect(page.getByText('photo.png')).toBeVisible();
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // The sent message renders the image attachment (alt text from crd-common
    // `messageAttachments.imageAlt`), fetched from the authorized document URL.
    const rendered = page.getByRole('img', { name: /attached image: photo\.png/i });
    await expect(rendered).toBeVisible();
    await expect(rendered).toHaveAttribute('src', /.+/);
  });
});
