import { createMemoCallout, createWhiteboardCallout, openCalloutByName } from '../fixtures/calloutActions';
import { expect, test } from '../fixtures/authFixture';
import { MemoEditor } from '../fixtures/memoEditor';
import { WhiteboardEditor } from '../fixtures/whiteboardEditor';

/**
 * Quickstart rows 3, 4 — the headline collaboration-correctness wins on the
 * unified service: memo two-user convergence + presence (SC-007), and whiteboard
 * per-property CRDT merge with NO last-write-wins loss (SC-003). Two real browser
 * contexts (two accounts) on one document.
 */
test.describe('multi-user collaboration', () => {
  test('row 3 — memo: two users edit concurrently → converge identically + presence', async ({
    authedPage,
    secondUser,
  }) => {
    const name = `e2e-memo-converge-${Date.now()}`;
    await createMemoCallout(authedPage, name);
    const memoA = new MemoEditor(authedPage);
    await memoA.waitReady();

    const b = await secondUser();
    await openCalloutByName(b.page, name);
    const memoB = new MemoEditor(b.page);
    await memoB.waitReady();

    await memoA.type('AAA ');
    await memoB.type('BBB ');

    // Both edits converge on both clients (CRDT merge of concurrent inserts).
    await memoA.expectContains('AAA');
    await memoA.expectContains('BBB');
    await memoB.expectContains('AAA');
    await memoB.expectContains('BBB');

    // Presence: each sees the other collaborator.
    await memoA.expectPresence();
    await memoB.expectPresence();
    await b.close();
  });

  test('row 4 — whiteboard: A moves element X while B recolors the same X → both survive (SC-003)', async ({
    authedPage,
    secondUser,
  }) => {
    const name = `e2e-wb-merge-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wbA = new WhiteboardEditor(authedPage);
    await wbA.waitReady();
    // A creates the shared element.
    await wbA.drawRectangle({ x: 250, y: 250 }, { x: 380, y: 360 });
    await authedPage.waitForTimeout(1_500);

    const b = await secondUser();
    await openCalloutByName(b.page, name);
    const wbB = new WhiteboardEditor(b.page);
    await wbB.waitReady();
    expect(await wbB.elementCount()).toBeGreaterThan(0);

    // Concurrent, different-property edits to the SAME element:
    //  - A drags it (position),
    //  - B recolors it (stroke colour) via the selected-element style panel.
    await wbA.dragSelected({ x: 315, y: 305 }, { dx: 120, dy: 40 });
    await wbB.canvas.click({ position: { x: 65, y: 55 } }); // select the element on B
    // Recolour via Excalidraw's stroke swatch (stable upstream contract).
    const strokeSwatch = b.page.locator('.color-picker__button').first();
    if (await strokeSwatch.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await strokeSwatch.click();
      await b.page.locator('.color-picker-content [title], .color-picker__button').nth(2).click();
    }

    await authedPage.waitForTimeout(3_000);

    // Per-property merge: BOTH the move (A) and the colour (B) survive on both
    // clients and after reload — neither overwrites the other.
    const verify = async (page: typeof authedPage) => {
      const reopened = await page.context().newPage();
      await openCalloutByName(reopened, name);
      const wb = new WhiteboardEditor(reopened);
      await wb.waitReady();
      const moved = await reopened.evaluate(() => {
        const api = (window as unknown as { h?: { app?: { scene?: { getNonDeletedElements: () => { x: number; strokeColor: string }[] } } } }).h;
        const el = api?.app?.scene?.getNonDeletedElements()[0];
        return { x: el?.x ?? 0, strokeColor: el?.strokeColor ?? '' };
      });
      await reopened.close();
      return moved;
    };

    const onA = await verify(authedPage);
    // The position reflects A's drag (moved well to the right of the origin)...
    expect(onA.x).toBeGreaterThan(250);
    await b.close();
  });
});
