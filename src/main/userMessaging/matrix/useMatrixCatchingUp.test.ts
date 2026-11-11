import { EventEmitter } from 'node:events';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown }));

vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));

import { useMatrixCatchingUp } from './useMatrixCatchingUp';

class FakeClient extends EventEmitter {
  constructor(private syncState: string | null) {
    super();
  }
  getSyncState = () => this.syncState;
  sync(state: string) {
    this.syncState = state;
    act(() => {
      this.emit('sync', state);
    });
  }
}

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

describe('useMatrixCatchingUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    harness.client = null;
  });

  it('is false without a Matrix client', () => {
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(false);
  });

  it('is true before the first sync and false once prepared', () => {
    const client = new FakeClient(null);
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(true);

    client.sync('PREPARED');
    expect(result.current).toBe(false);
  });

  it.each(['CATCHUP', 'RECONNECTING', 'ERROR'])('is true while the sync state is %s, until it syncs', state => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(false);

    client.sync(state);
    expect(result.current).toBe(true);

    client.sync('SYNCING');
    expect(result.current).toBe(false);
  });

  it('is true from returning to the foreground until the next sync', () => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());

    setVisibility('hidden');
    expect(result.current).toBe(false);

    setVisibility('visible');
    expect(result.current).toBe(true);

    client.sync('SYNCING');
    expect(result.current).toBe(false);
  });

  it('ends the foreground window after the timeout when no sync arrives', () => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());

    setVisibility('visible');
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(9_999);
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });
});
