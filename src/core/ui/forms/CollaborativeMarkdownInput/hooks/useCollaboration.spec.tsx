import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Y from 'yjs';

type Instance = { documentId: string; doc: Y.Doc; connected: boolean; destroyed: boolean };
const instances: Instance[] = [];
const order: string[] = [];
let stateHandler: ((state: unknown) => void) | undefined;
let controlHandler: ((control: unknown) => void) | undefined;
const { notifySpy } = vi.hoisted(() => ({ notifySpy: vi.fn() }));

vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: class {
    documentId: string;
    doc: Y.Doc;
    connected = false;
    destroyed = false;
    awareness = {};
    state = { status: 'connecting' as const };
    constructor(options: { documentId: string; doc: Y.Doc }) {
      this.documentId = options.documentId;
      this.doc = options.doc;
      instances.push(this as unknown as Instance);
      order.push(`construct:${options.documentId}`);
    }
    on(event: string, handler: (value: unknown) => void) {
      if (event === 'state') stateHandler = handler;
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
vi.mock('@tiptap/extension-collaboration', () => ({ default: { configure: () => ({}) } }));
vi.mock('@tiptap/extension-collaboration-caret', () => ({ default: { configure: () => ({}) } }));

import { useCollaboration } from './useCollaboration';

describe('useCollaboration', () => {
  beforeEach(() => {
    instances.length = 0;
    order.length = 0;
    stateHandler = undefined;
    controlHandler = undefined;
    notifySpy.mockClear();
  });

  it('owns one stable Y.Doc per memo id and destroys A before B connects', () => {
    const { rerender } = renderHook(({ id }) => useCollaboration({ collaborationId: id }), {
      initialProps: { id: 'memo-a' },
    });
    const firstDoc = instances[0].doc;
    firstDoc.getText('default').insert(0, 'memo-a');

    act(() => rerender({ id: 'memo-b' }));

    expect(instances).toHaveLength(2);
    expect(instances[1].doc).not.toBe(firstDoc);
    expect(instances[1].doc.getText('default').toString()).toBe('');
    expect(order.indexOf('destroy:memo-a')).toBeLessThan(order.indexOf('connect:memo-b'));
  });

  it('exposes the provider state without a second memo lifecycle vocabulary', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'memo-a' }));
    expect(result.current.state).toEqual({ status: 'connecting' });

    act(() => stateHandler?.({ status: 'ready' }));
    expect(result.current.state).toEqual({ status: 'ready' });

    act(() => stateHandler?.({ status: 'reconnecting' }));
    expect(result.current.state).toEqual({ status: 'reconnecting' });
  });

  it('handles save and read-only controls without reclassifying connection state', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'memo-a' }));

    act(() => controlHandler?.({ kind: 'save-error' }));
    expect(notifySpy).toHaveBeenCalledWith('callout.memo.saveFailed', 'warning');

    act(() => controlHandler?.({ kind: 'read-only-state', readOnly: true, reason: 'no-update-access' }));
    expect(result.current.isReadOnly).toBe(true);
    expect(result.current.state).toEqual({ status: 'connecting' });
  });
});
