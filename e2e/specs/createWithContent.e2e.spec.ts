import { createMemoCallout, createWhiteboardCallout, openCalloutByName } from '../fixtures/calloutActions';
import { expect, test } from '../fixtures/authFixture';
import { MemoEditor } from '../fixtures/memoEditor';
import { WhiteboardEditor } from '../fixtures/whiteboardEditor';

/**
 * Quickstart rows 1, 2, 13 — the headline correctness promise (SC-002): created
 * content is present and editable when reopened; empty creation opens empty and
 * editable. Driven through the real UI against the deployed unified stack.
 */
test.describe('create-with-content → reopen', () => {
  test('row 1 — memo: type text, reopen in a fresh session, text present + editable', async ({ authedPage }) => {
    const name = `e2e-memo-${Date.now()}`;
    await createMemoCallout(authedPage, name);

    const memo = new MemoEditor(authedPage);
    await memo.waitReady();
    await memo.type('hello from the matrix');
    // Wait for the collab room to debounce a snapshot save.
    await authedPage.waitForTimeout(3_000);

    // Reopen in a fresh page (new tab → new editor mount → reload from storage seed).
    const fresh = await authedPage.context().newPage();
    await openCalloutByName(fresh, name);
    const reopened = new MemoEditor(fresh);
    await reopened.waitReady();
    await reopened.expectContains('hello from the matrix'); // SC-002
    await reopened.expectEditable();
    await fresh.close();
  });

  test('row 2 — whiteboard: draw a shape, reopen, shape present + editable (not read-only)', async ({ authedPage }) => {
    const name = `e2e-wb-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);

    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    expect(await wb.elementCount()).toBeGreaterThan(0);
    await authedPage.waitForTimeout(3_000);

    const fresh = await authedPage.context().newPage();
    await openCalloutByName(fresh, name);
    const reopened = new WhiteboardEditor(fresh);
    await reopened.waitReady();
    expect(await reopened.elementCount()).toBeGreaterThan(0); // SC-002
    await reopened.expectEditable(); // not read-only
    await fresh.close();
  });

  test('row 13 — empty creation opens empty + editable, no error', async ({ authedPage }) => {
    const memoName = `e2e-empty-memo-${Date.now()}`;
    await createMemoCallout(authedPage, memoName);
    const memo = new MemoEditor(authedPage);
    await memo.waitReady();
    expect(await memo.text()).toBe('');
    await memo.expectEditable(); // FR-010

    const wbName = `e2e-empty-wb-${Date.now()}`;
    await createWhiteboardCallout(authedPage, wbName);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    expect(await wb.elementCount()).toBe(0);
    await wb.expectEditable(); // FR-010
  });
});
