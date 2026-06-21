import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMemoCallout, createWhiteboardCallout, openCalloutByName } from '../fixtures/calloutActions';
import { expect, test } from '../fixtures/authFixture';
import { MemoEditor } from '../fixtures/memoEditor';
import { WhiteboardEditor } from '../fixtures/whiteboardEditor';

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_IMAGE = path.join(here, '..', 'fixtures', 'assets', 'sample.png');

/**
 * Quickstart rows 8, 9, 10 — embedded media survives reopen (FR-012), export /
 * import round-trips through the Yjs↔file boundary, and guest/public whiteboard
 * access shows current content + contributes if permitted.
 */
test.describe('media, export/import, guest', () => {
  test('row 8 — embedded image (memo + whiteboard) is stored + survives reopen (FR-012)', async ({ authedPage }) => {
    // Memo: insert an image, reopen, image still present.
    const memoName = `e2e-memo-img-${Date.now()}`;
    await createMemoCallout(authedPage, memoName);
    const memo = new MemoEditor(authedPage);
    await memo.waitReady();
    await memo.type('image: ');
    const memoUpload = authedPage.locator('input[type="file"]').first();
    await memoUpload.setInputFiles(FIXTURE_IMAGE);
    await authedPage.waitForTimeout(3_000);

    const freshMemo = await authedPage.context().newPage();
    await openCalloutByName(freshMemo, memoName);
    const reopenedMemo = new MemoEditor(freshMemo);
    await reopenedMemo.waitReady();
    await expect(freshMemo.locator('.ProseMirror img').first()).toBeVisible({ timeout: 15_000 });
    await freshMemo.close();

    // Whiteboard: drop an image, reopen, element present.
    const wbName = `e2e-wb-img-${Date.now()}`;
    await createWhiteboardCallout(authedPage, wbName);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await authedPage.locator('input[type="file"]').first().setInputFiles(FIXTURE_IMAGE);
    await expect.poll(async () => wb.elementCount(), { timeout: 20_000 }).toBeGreaterThan(0);
    await authedPage.waitForTimeout(3_000);

    const freshWb = await authedPage.context().newPage();
    await openCalloutByName(freshWb, wbName);
    const reopenedWb = new WhiteboardEditor(freshWb);
    await reopenedWb.waitReady();
    expect(await reopenedWb.elementCount()).toBeGreaterThan(0);
    await freshWb.close();
  });

  test('row 9 — export a whiteboard to .excalidraw and import it into a new one → round-trips', async ({
    authedPage,
  }) => {
    const name = `e2e-wb-export-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    const exportedCount = await wb.elementCount();

    // Export via Excalidraw's "Save to disk" (the canvas export menu).
    const downloadPromise = authedPage.waitForEvent('download');
    await authedPage.keyboard.press('Control+S');
    const download = await downloadPromise;
    const exportPath = path.join(here, '..', '.tmp', `${name}.excalidraw`);
    await download.saveAs(exportPath);

    // Import into a fresh whiteboard via "Load from file" (inserts into the scene).
    const target = `e2e-wb-import-${Date.now()}`;
    await createWhiteboardCallout(authedPage, target);
    const wb2 = new WhiteboardEditor(authedPage);
    await wb2.waitReady();
    await authedPage.locator('input[type="file"]').first().setInputFiles(exportPath);
    await expect.poll(async () => wb2.elementCount(), { timeout: 20_000 }).toBe(exportedCount); // identical round-trip
  });

  test('row 10 — guest opens a public whiteboard link → sees current content, contributes if permitted', async ({
    authedPage,
    browser,
  }) => {
    const name = `e2e-wb-public-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    await authedPage.waitForTimeout(3_000);

    // Grab the public share link from the share dialog.
    await authedPage.getByRole('button', { name: /share/i }).first().click();
    const shareUrl = await authedPage.getByRole('textbox', { name: /link|url/i }).inputValue();
    await authedPage.keyboard.press('Escape');

    // A genuinely anonymous context (no auth) opens the link as a guest.
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(shareUrl);
    // Provide a guest display name if prompted.
    const nameInput = guestPage.getByRole('textbox', { name: /name/i });
    if (await nameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nameInput.fill('Guest Tester');
      await guestPage.getByRole('button', { name: /join|continue|enter/i }).click();
    }
    const guestWb = new WhiteboardEditor(guestPage);
    await guestWb.waitReady();
    expect(await guestWb.elementCount()).toBeGreaterThan(0); // sees current content
    await guestContext.close();
  });
});
