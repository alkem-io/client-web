import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';

// Capture every UnifiedCollabProvider instance + a global lifecycle order log so the
// test can prove room B gets a fresh doc and provider A is torn down before B connects.
const order: string[] = [];
type Inst = { documentId: string; doc: Y.Doc; connected: boolean; destroyed: boolean };
const instances: Inst[] = [];
// The most-recent provider's listeners, so a test can inject a control frame and drive
// the readiness (status/synced) callbacks of whichever generation is currently wired.
let controlHandler: ((arg: unknown) => void) | undefined;
let statusHandler: ((arg: unknown) => void) | undefined;
let syncedHandler: ((arg: unknown) => void) | undefined;
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
    on(event: string, handler: (arg: unknown) => void) {
      if (event === 'control') controlHandler = handler;
      else if (event === 'status') statusHandler = handler;
      else if (event === 'synced') syncedHandler = handler;
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
  classifySessionEnd: (m: { code?: string; scope?: string; disposition?: string }) =>
    m.code === 'update-not-accepted' && m.scope === 'member' && m.disposition === 'transient'
      ? { code: m.code, scope: m.scope, disposition: m.disposition }
      : null,
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
    statusHandler = undefined;
    syncedHandler = undefined;
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

  it('an update-rejected control DISCARDS the refused generation, DROPS readiness until the fresh doc/provider resyncs, and shows an honest notice', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    expect(instances).toHaveLength(1);
    const providerA = instances[0];
    const docA = providerA.doc;
    // The refused generation holds a local edit the server rejected.
    docA.getText('content').insert(0, 'refused-edit');
    // Bring generation A to READY (connected + synced) — the precondition the gap needs:
    // without a readiness reset the stale ready state would survive the swap.
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(result.current.status).toBe('connected');
    expect(result.current.synced).toBe(true);

    act(() => controlHandler?.({ kind: 'update-rejected' }));

    // A FRESH provider + doc replaced the refused one; the refused doc is NOT reused
    // (B starts empty and resyncs server-canonical via its handshake).
    expect(instances).toHaveLength(2);
    const providerB = instances[1];
    expect(providerB.doc).not.toBe(docA);
    expect(providerB.doc.getText('content').toString()).toBe('');
    // The old provider was DESTROYED and the fresh one CONNECTED (resync); destroy before the fresh connect.
    expect(providerA.destroyed).toBe(true);
    expect(providerB.connected).toBe(true);
    expect(order.indexOf('destroy:room-A')).toBeLessThan(order.lastIndexOf('connect:room-A'));
    // READINESS DROPS IMMEDIATELY (CrdMemoDialog gates edits on connected && synced) and
    // stays down — this is the assertion that fails if setSynced(false) is omitted.
    expect(result.current.status).not.toBe('connected');
    expect(result.current.synced).toBe(false);
    // Only the FRESH provider's OWN callbacks (statusHandler/syncedHandler now point at B,
    // since A's effect cleanup unregistered A's) restore readiness — not a stale flip.
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(result.current.status).toBe('connected');
    expect(result.current.synced).toBe(true);
    // The user got an honest, translated rejection notice.
    expect(notifySpy).toHaveBeenCalledWith('callout.memo.updateRejected', 'warning');
  });

  it('a transient update-not-accepted session-end DROPS readiness + shows a notice, WITHOUT recreating the doc/provider (the provider owns reconnect)', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    expect(instances).toHaveLength(1);
    const providerA = instances[0];
    // Bring to READY.
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });
    expect(result.current.status).toBe('connected');
    expect(result.current.synced).toBe(true);

    act(() =>
      controlHandler?.({
        kind: 'session-end',
        code: 'update-not-accepted',
        scope: 'member',
        disposition: 'transient',
      })
    );

    // Readiness drops immediately (editor blocks edits during the queue→drain window) + notice.
    expect(result.current.status).not.toBe('connected');
    expect(result.current.synced).toBe(false);
    expect(notifySpy).toHaveBeenCalledWith('callout.memo.updateNotAccepted', 'warning');
    // NO manual reconnect / recovery generation: the SAME provider stays (not destroyed, not
    // replaced) — the provider's close handler is the sole reconnect owner.
    expect(instances).toHaveLength(1);
    expect(providerA.destroyed).toBe(false);
  });

  it('an unknown/inconsistent session-end tuple is NOT trusted (no readiness drop, no notice)', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    act(() => {
      statusHandler?.('connected');
      syncedHandler?.(true);
    });

    // Inconsistent tuple (transient claimed for a code the mock table would reject) → null.
    act(() =>
      controlHandler?.({
        kind: 'session-end',
        code: 'totally-made-up',
        scope: 'member',
        disposition: 'transient',
      })
    );

    expect(result.current.status).toBe('connected');
    expect(result.current.synced).toBe(true);
    expect(notifySpy).not.toHaveBeenCalledWith('callout.memo.updateNotAccepted', 'warning');
  });
});
