import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Y from 'yjs';

type MockProvider = {
  options: { documentId: string; doc: Y.Doc };
  readOnlyReason?: string;
  emitState: (state: unknown) => void;
  emitSaved: (error?: string) => void;
};
const harness = vi.hoisted(() => ({ instances: [] as MockProvider[], order: [] as string[] }));

vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: class {
    state = { kind: 'loading' };
    readOnlyReason: string | undefined;
    hasUnsavedChanges = false;
    private stateListeners = new Set<(state: unknown) => void>();
    private saveListeners = new Set<(error?: string) => void>();

    constructor(public options: { documentId: string; doc: Y.Doc }) {
      harness.instances.push(this);
      harness.order.push(`construct:${options.documentId}`);
    }

    subscribe = (listener: (state: unknown) => void) => {
      this.stateListeners.add(listener);
      listener(this.state);
      return () => this.stateListeners.delete(listener);
    };
    onSaveResult = (listener: (error?: string) => void) => {
      this.saveListeners.add(listener);
      return () => this.saveListeners.delete(listener);
    };
    connect = () => harness.order.push(`connect:${this.options.documentId}`);
    destroy = () => harness.order.push(`destroy:${this.options.documentId}`);
    requestDurability = vi.fn().mockResolvedValue(undefined);
    hasChangesAtRisk = false;
    emitState = (state: unknown) => {
      this.state = state as { kind: string };
      for (const listener of this.stateListeners) listener(state);
    };
    emitSaved = (error?: string) => {
      for (const listener of this.saveListeners) listener(error);
    };
  },
}));

import { useCollaboration } from '@/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration';

describe('useCollaboration', () => {
  beforeEach(() => {
    harness.instances.length = 0;
    harness.order.length = 0;
  });

  it('owns one fresh document and provider per collaboration id', () => {
    const { result, rerender } = renderHook(({ id }) => useCollaboration({ collaborationId: id }), {
      initialProps: { id: 'room-A' },
    });
    const first = harness.instances[0];
    const destroyFirstDoc = vi.spyOn(first.options.doc, 'destroy');
    first.options.doc.getText('content').insert(0, 'room A');
    first.readOnlyReason = 'noUpdateAccess';
    act(() => first.emitState({ kind: 'active', access: 'read', save: 'saved' }));
    act(() => first.emitSaved());

    rerender({ id: 'room-B' });

    const second = harness.instances[1];
    expect(second.options.doc).not.toBe(first.options.doc);
    expect(second.options.doc.getText('content').toString()).toBe('');
    expect(destroyFirstDoc).toHaveBeenCalledOnce();
    expect(harness.order.indexOf('destroy:room-A')).toBeLessThan(harness.order.indexOf('connect:room-B'));
    expect(result.current).toMatchObject({
      status: 'connecting',
      synced: false,
      lastSaveTime: undefined,
      lastSaveError: undefined,
      readOnlyCode: undefined,
      lifecycle: { kind: 'loading' },
    });
  });

  it('keeps a previously synced writer editable while the disposable transport is offline', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    const provider = harness.instances[0];
    act(() => provider.emitState({ kind: 'active', access: 'write', save: 'saved' }));
    expect(result.current).toMatchObject({ status: 'connected', synced: true, isReadOnly: false });

    act(() => provider.emitState({ kind: 'active', access: 'write', save: 'offline' }));
    expect(result.current).toMatchObject({ status: 'disconnected', synced: true, isReadOnly: false });
    expect(harness.instances).toHaveLength(1);
  });

  it('projects read admission and terminal end without inventing a second lifecycle', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    const provider = harness.instances[0];
    provider.readOnlyReason = 'noUpdateAccess';
    act(() => provider.emitState({ kind: 'active', access: 'read', save: 'saved' }));
    expect(result.current).toMatchObject({ synced: true, isReadOnly: true, readOnlyCode: 'noUpdateAccess' });

    act(() => provider.emitState({ kind: 'ended', reason: 'forbidden', recovery: 'none' }));
    expect(result.current).toMatchObject({ status: 'disconnected', synced: true, isReadOnly: true });
  });

  it('records a successful save result without changing connection state', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T00:00:00Z'));
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    act(() => harness.instances[0].emitSaved());
    expect(result.current.lastSaveTime).toEqual(new Date('2026-08-29T00:00:00Z'));
    vi.useRealTimers();
  });

  it('surfaces and clears save failures independently of connection state', () => {
    const { result } = renderHook(() => useCollaboration({ collaborationId: 'room-A' }));
    act(() => harness.instances[0].emitSaved('storage unavailable'));
    expect(result.current.lastSaveError).toBe('storage unavailable');
    act(() => harness.instances[0].emitSaved());
    expect(result.current.lastSaveError).toBeUndefined();
  });
});
