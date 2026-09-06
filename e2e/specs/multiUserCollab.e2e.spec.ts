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
    const initial = await wbB.firstElementState();

    // Concurrent, different-property edits to the SAME element:
    //  - A drags it (position),
    //  - B recolors it (stroke colour) via the selected-element style panel.
    await wbA.dragSelected({ x: 315, y: 305 }, { dx: 120, dy: 40 });
    await wbB.canvas.click({ position: { x: 65, y: 55 } }); // select the element on B
    // Recolour via Excalidraw's stroke swatch (stable upstream contract).
    const strokeSwatch = b.page.locator('.color-picker__button').first();
    await expect(strokeSwatch).toBeVisible({ timeout: 5_000 });
    await strokeSwatch.click();
    await b.page.locator('.color-picker-content [title], .color-picker__button').nth(2).click();

    await expect
      .poll(async () => (await wbB.firstElementState()).strokeColor, { timeout: 15_000 })
      .not.toBe(initial.strokeColor);
    const changedColor = (await wbB.firstElementState()).strokeColor;

    await authedPage.waitForTimeout(3_000);

    // Per-property merge: BOTH the move (A) and the colour (B) survive on both
    // clients and after reload — neither overwrites the other.
    const verify = async (page: typeof authedPage) => {
      const reopened = await page.context().newPage();
      await openCalloutByName(reopened, name);
      const wb = new WhiteboardEditor(reopened);
      await wb.waitReady();
      const moved = await wb.firstElementState();
      await reopened.close();
      return moved;
    };

    await expect.poll(async () => (await wbA.firstElementState()).strokeColor).toBe(changedColor);
    await expect.poll(async () => (await wbB.firstElementState()).x).toBeGreaterThan(initial.x);
    const onA = await verify(authedPage);
    const onB = await verify(b.page);
    // The position reflects A's drag and the colour reflects B's choice on both reloads.
    expect(onA.x).toBeGreaterThan(250);
    expect(onA.strokeColor).toBe(changedColor);
    expect(onB.x).toBeGreaterThan(250);
    expect(onB.strokeColor).toBe(changedColor);
    await b.close();
  });
});
