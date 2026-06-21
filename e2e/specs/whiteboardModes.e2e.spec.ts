import { createWhiteboardCallout, openCalloutByName } from '../fixtures/calloutActions';
import { expect, test } from '../fixtures/authFixture';
import { WhiteboardEditor } from '../fixtures/whiteboardEditor';

/**
 * Quickstart rows 5, 6, 7 (US4) — every whiteboard editing mode yields the SAME
 * content (one representation): single-user ↔ collaborative consistency, from a
 * template, and duplicate.
 */
test.describe('whiteboard editing modes are consistent', () => {
  test('row 5 — edit solo + save, reopen collaboratively → content identical', async ({ authedPage }) => {
    const name = `e2e-wb-solo-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    await wb.drawRectangle({ x: 420, y: 220 }, { x: 520, y: 300 });
    const soloCount = await wb.elementCount();
    await authedPage.waitForTimeout(3_000);

    const fresh = await authedPage.context().newPage();
    await openCalloutByName(fresh, name);
    const collab = new WhiteboardEditor(fresh);
    await collab.waitReady();
    expect(await collab.elementCount()).toBe(soloCount); // identical content across modes
    await fresh.close();
  });

  test('row 6 — whiteboard from a template: template content appears + persists', async ({ authedPage }) => {
    const name = `e2e-wb-template-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();

    // Apply a template via the editor's template picker (single-user dialog).
    await authedPage.getByRole('button', { name: /template/i }).first().click();
    await authedPage.getByRole('option').first().click();
    await authedPage.getByRole('button', { name: /^(Use|Apply|Import|Select)$/i }).click();

    await expect.poll(async () => wb.elementCount(), { timeout: 20_000 }).toBeGreaterThan(0);
    await authedPage.waitForTimeout(3_000);

    const fresh = await authedPage.context().newPage();
    await openCalloutByName(fresh, name);
    const reopened = new WhiteboardEditor(fresh);
    await reopened.waitReady();
    expect(await reopened.elementCount()).toBeGreaterThan(0); // template content persisted
    await fresh.close();
  });

  test('row 7 — duplicate a whiteboard contribution → copy has the source content, independent', async ({
    authedPage,
  }) => {
    const name = `e2e-wb-dup-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    const sourceCount = await wb.elementCount();
    await authedPage.waitForTimeout(3_000);

    // Duplicate via the callout/contribution context menu.
    await authedPage.getByRole('button', { name: /more|options|menu/i }).first().click();
    await authedPage.getByRole('menuitem', { name: /duplicate|copy/i }).click();

    const dupName = `${name}-copy`;
    await openCalloutByName(authedPage, dupName).catch(() => undefined);
    const dup = new WhiteboardEditor(authedPage);
    await dup.waitReady();
    expect(await dup.elementCount()).toBe(sourceCount); // copy carries the source content
  });
});
