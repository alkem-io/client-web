import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';

// Capture every UnifiedCollabProvider instance + a global lifecycle order log so the
// test can prove room B gets a fresh doc and provider A is torn down before B connects.
const order: string[] = [];
type Inst = { documentId: string; doc: Y.Doc; connected: boolean; destroyed: boolean };
const instances: Inst[] = [];
// The most-recent provider's `control` listener, so a test can inject a control frame.
let controlHandler: ((message: { kind: string }) => void) | undefined;
const { notifySpy } = vi.hoisted(() => ({ notifySpy: vi.fn() }));

vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: class {
    documentId: string;
    doc: Y.Doc;
    connected = false;
    destroyed = false;
    constructor(opts: { documentId: string; doc: Y.Doc }) {
      this.documentId = opts.documentId;
      this.doc = opts.doc;
      instances.push(this as unknown as Inst);
      order.push(`construct:${opts.documentId}`);
    }
    on(event: string, handler: (message: { kind: string }) => void) {
      if (event === 'control') controlHandler = handler;
    }
    connect() {
      this.connected = true;
      order.push(`connect:${this.documentId}`);
    }
    destroy() {
      this.destroyed = true;
      order.push(`destroy:${this.documentId}`);
    }
  },
  controlReasonToReadOnlyCode: () => undefined,
}));

vi.mock('../useUserCursor', () => ({ default: () => ({ userId: 'u1', userName: 'U', cursorColor: '#000' }) }));
vi.mock('../../../notifications/useNotification', () => ({ useNotification: () => notifySpy }));
vi.mock('@/core/utils/useOnlineStatus', () => ({ useOnlineStatus: () => true }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@tiptap/extension-collaboration', () => ({ default: { extend: () => ({ configure: () => ({}) }) } }));
vi.mock('@tiptap/extension-collaboration-caret', () => ({ default: { extend: () => ({ configure: () => ({}) }) } }));
vi.mock('@/core/logging/sentry/log', () => ({ warn: vi.fn(), TagCategoryValues: { MEMO: 'memo' } }));

import { useCollaboration } from './useCollaboration';

describe('useCollaboration — one Y.Doc per collaborationId (no cross-document leak)', () => {
  beforeEach(() => {
    order.length = 0;
    instances.length = 0;
    controlHandler = undefined;
    notifySpy.mockClear();
  });

  it('an in-place collaborationId A→B swap gives room B a FRESH doc — B never inherits A state, provider A torn down first', () => {
    const { rerender } = renderHook(({ id }) => useCollaboration({ collaborationId: id }), {
      initialProps: { id: 'room-A' },
    });
    expect(instances).toHaveLength(1);
    const docA = instances[0].doc;
    // Memo A's CRDT content lives in the doc bound to room A.
    docA.getText('content').insert(0, 'secret-from-A');

    // The memoId changes IN PLACE (deep-link/route change) — the dialog is not keyed by memoId.
    act(() => rerender({ id: 'room-B' }));

    expect(instances).toHaveLength(2);
    const docB = instances[1].doc;
    // Room B must get its OWN doc, never the stale component-lifetime doc holding A.
    expect(docB).not.toBe(docA);
    // So B's handshake (provider.connect → SyncStep2 of its doc) cannot contain A's state.
    expect(docB.getText('content').toString()).toBe('');
    expect(Y.encodeStateAsUpdate(docB).length).toBeLessThan(Y.encodeStateAsUpdate(docA).length);
    // Lifecycle: provider A is destroyed BEFORE provider B connects (does its handshake).
    expect(instances[0].destroyed).toBe(true);
    expect(instances[1].connected).toBe(true);
    expect(order.indexOf('destroy:room-A')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('destroy:room-A')).toBeLessThan(order.indexOf('connect:room-B'));
  });

  it('a save-error control notifies via the translated key, not a hardcoded string', () => {
    renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    expect(typeof controlHandler).toBe('function');

    act(() => controlHandler?.({ kind: 'save-error' }));

    // The mocked t() returns the key verbatim, so this asserts the key is used
    // (and, critically, that it is NOT the old hardcoded English 'Unable to save changes').
    expect(notifySpy).toHaveBeenCalledWith('callout.memo.saveFailed', 'warning');
  });
});
