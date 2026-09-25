import { expect, test } from '@playwright/test';

// Full local stack, an authenticated E2E_STORAGE_STATE and a member conversation
// with a usable bucket are required. The separate Element/browser evidence is
// recorded in agents-hq/specs/013-matrix-media-file-service/verification-2026-09-22.md.
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const CONVERSATION_PATH = process.env.E2E_CONVERSATION_PATH;
const CONVERSATION_B_NAME = process.env.E2E_CONVERSATION_B_NAME;

test.describe('conversation attachments', () => {
  test.skip(!CONVERSATION_PATH, 'Set E2E_CONVERSATION_PATH and run the full stack.');

  test('selection stays local; sent images load real pixels, including from history', async ({ page }) => {
    await page.goto(`${BASE_URL}${CONVERSATION_PATH}`);
    const uploads: string[] = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/graphql') && request.headers()['content-type']?.startsWith('multipart/form-data')) {
        uploads.push(request.url());
      }
    });
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /attach files/i }).click();
    await (await chooser).setFiles('e2e/fixtures/assets/attachment-smoke.png');
    const selected = page.getByRole('list', { name: /files to send/i });
    await expect(selected.getByText('attachment-smoke.png')).toBeVisible();
    expect(uploads).toHaveLength(0);
    const images = page.getByRole('img', { name: 'Attached image: attachment-smoke.png', exact: true });
    const previousCount = await images.count();
    await page.getByRole('button', { name: /^send$/i }).click();
    await expect(selected).toHaveCount(0);
    await expect(images).toHaveCount(previousCount + 1);
    const image = images.last();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(uploads).toHaveLength(1);

    await page.goto(`${BASE_URL}${CONVERSATION_PATH}`);
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });

  test('switching A to B and back discards local files', async ({ page }) => {
    test.skip(!CONVERSATION_B_NAME || !process.env.E2E_CONVERSATION_A_NAME, 'Set both E2E_CONVERSATION_A_NAME and E2E_CONVERSATION_B_NAME.');
    await page.goto(`${BASE_URL}${CONVERSATION_PATH}`);
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /attach files/i }).click();
    await (await chooser).setFiles('e2e/fixtures/assets/attachment-smoke.png');
    const selected = page.getByRole('list', { name: /files to send/i });
    await expect(selected.getByText('attachment-smoke.png')).toBeVisible();
    await page.getByRole('button', { name: /back to conversations/i }).click();
    await page.getByRole('button', { name: CONVERSATION_B_NAME }).click();
    await expect(selected).toHaveCount(0);
    await page.getByRole('button', { name: /back to conversations/i }).click();
    // A is reached through the running application; a reload would hide a
    // broken draft lifetime by recreating every component.
    await page.getByRole('button', { name: process.env.E2E_CONVERSATION_A_NAME }).click();
    await expect(selected).toHaveCount(0);
  });
});
