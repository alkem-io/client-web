import { createMemoCallout, createWhiteboardCallout, openCalloutByName } from '../fixtures/calloutActions';
import { expect, test } from '../fixtures/authFixture';
import { MemoEditor } from '../fixtures/memoEditor';
import { WhiteboardEditor } from '../fixtures/whiteboardEditor';

/**
 * Quickstart rows 11, 12 — offline/reconnect reconciliation (US7) and GENUINE
 * read-only (content shown, editing blocked, distinct from a loading/connecting
 * state — FR-009).
 */
test.describe('resilience + read-only', () => {
  test('row 11 — offline/reconnect (memo + whiteboard): offline + concurrent edits both survive', async ({
    authedPage,
    secondUser,
  }) => {
    const name = `e2e-memo-offline-${Date.now()}`;
    await createMemoCallout(authedPage, name);
    const memo = new MemoEditor(authedPage);
    await memo.waitReady();
    await memo.type('online-1 ');
    await authedPage.waitForTimeout(2_000);

    const remote = await secondUser();
    await openCalloutByName(remote.page, name);
    const remoteMemo = new MemoEditor(remote.page);
    await remoteMemo.waitReady();

    // Partition the primary editor's actual context. While it edits offline, a
    // second live collaborator writes to the room; reconnect must merge both.
    await authedPage.context().setOffline(true);
    await memo.type('offline-edit ');
    await remoteMemo.type('remote-edit ');
    await authedPage.waitForTimeout(1_500);
    await authedPage.context().setOffline(false);

    // On reconnect, offline edits reconcile with the room (no loss).
    await memo.expectContains('online-1');
    await memo.expectContains('offline-edit');
    await memo.expectContains('remote-edit');
    await remoteMemo.expectContains('offline-edit');

    // Whiteboard parity: an element drawn offline survives the reconnect.
    const wbName = `e2e-wb-offline-${Date.now()}`;
    await createWhiteboardCallout(authedPage, wbName);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await authedPage.context().setOffline(true);
    await wb.drawRectangle();
    const offlineCount = await wb.elementCount();
    expect(offlineCount).toBeGreaterThan(0);
    await authedPage.context().setOffline(false);
    await authedPage.waitForTimeout(3_000);

    const fresh = await authedPage.context().newPage();
    await openCalloutByName(fresh, wbName);
    const reopened = new WhiteboardEditor(fresh);
    await reopened.waitReady();
    expect(await reopened.elementCount()).toBe(offlineCount); // offline edit persisted on reconnect
    await fresh.close();
    await remote.close();
  });

  test('row 12 — a user without edit rights sees content, editing blocked (distinct from loading)', async ({
    authedPage,
    readonlyUser,
  }) => {
    // Primary creates a whiteboard with content and locks it to view-only for others.
    const name = `e2e-wb-readonly-${Date.now()}`;
    await createWhiteboardCallout(authedPage, name);
    const wb = new WhiteboardEditor(authedPage);
    await wb.waitReady();
    await wb.drawRectangle();
    await authedPage.waitForTimeout(3_000);

    // The second account (a viewer without update rights) opens it.
    const viewer = await readonlyUser();
    await openCalloutByName(viewer.page, name);
    const viewerWb = new WhiteboardEditor(viewer.page);
    await viewerWb.waitReady();
    expect(await viewerWb.elementCount()).toBeGreaterThan(0); // content shown
    await viewerWb.expectReadOnly(); // editing blocked — NOT a loading state (FR-009)
    await viewer.close();
  });
});
