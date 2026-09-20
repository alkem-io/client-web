import { expect, test } from '@playwright/test';

/**
 * E2E: conversation message attachments — attach → send → render (feature 013).
 *
 * STATUS: NOT RUN in this environment. Requires the full running stack and is
 * NOT wired into CI. To run it you need ALL of:
 *   1. The Chromium browser binary (`@playwright/test` itself is already a
 *        devDependency — only the browser has to be fetched):
 *        pnpm exec playwright install chromium
 *   2. The web app on http://localhost:3001 with the Alkemio backend on :3000
 *        (matrix-adapter + file-service + Synapse — the full conversation stack).
 *   3. A conversation whose `Conversation.storageBucket` resolves NON-NULL. That
 *        bucket is the *only* thing that makes the composer's attach affordance
 *        appear — availability is derived from `storageBucket != null`, not from
 *        any platform feature flag. With a null bucket the affordance stays inert
 *        and this spec will correctly not find the attach control. See
 *        `src/main/crdPages/unifiedChat/attachments/useConversationStorageConfig.ts`.
 *   4. The authenticated session being a MEMBER of the conversation: the bucket
 *        is READ-gated, so a non-member sees it as null and gets no attach
 *        affordance (same inert path as 3).
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
// The *display name* of a second conversation the same session is a member of,
// for the switch-resets-the-draft scenario (round-2 review finding 1). A name
// rather than a URL because that conversation has to be reached by clicking the
// running chat UI — see the test for why a URL would defeat it. Pick a name that
// is unambiguous within the conversation list.
const CONVERSATION_B_NAME = process.env.E2E_CONVERSATION_B_NAME;

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

  // Round-2 review finding 1: a staged-but-unsent attachment must NOT survive a
  // conversation switch — its document lives in conversation A's bucket and
  // would be READ-gate-rejected if it rode along on a send in conversation B.
  //
  // The switch MUST happen inside the running app. `page.goto` creates a new
  // document, so React remounts the composer and the staged state is gone no
  // matter what — a navigation-based version of this test passes even when the
  // in-app reset is broken, i.e. it cannot fail for the reason it claims to
  // test. Driving the chat UI keeps the composer mounted, so only the app's own
  // conversation-change reset can clear the chip.
  test('staging in one conversation does not carry over after switching to another', async ({ page }) => {
    test.skip(!CONVERSATION_B_NAME, 'Set E2E_CONVERSATION_B_NAME (a second member conversation) to enable.');

    await page.goto(`${BASE_URL}${CONVERSATION_PATH}`);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /attach files/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('e2e/fixtures/photo.png');

    // Scope the chip assertions to the composer's staged list (aria-label from
    // crd-space `comments.attachments.stagedListLabel`) so a thread message that
    // merely mentions the filename cannot satisfy — or defeat — them.
    const stagedList = page.getByRole('list', { name: /files to send/i });
    await expect(stagedList.getByText('photo.png')).toBeVisible();

    // Back to the conversation list, then select B — both are in-app clicks, no
    // document reload. Labels: crd-chat `thread.back`, and the row's accessible
    // name contains the conversation display name.
    await page.getByRole('button', { name: /back to conversations/i }).click();
    await page.getByRole('button', { name: CONVERSATION_B_NAME }).click();

    // The staged list unmounts entirely once nothing is staged, so this asserts
    // the chip is gone — before anything is sent.
    await expect(stagedList).toHaveCount(0);

    // A text-only send in B must succeed (it carries no stale document ids).
    const composer = page.getByRole('textbox');
    await composer.fill('plain text, no attachment');
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    await expect(page.getByText('plain text, no attachment')).toBeVisible();
  });
});
