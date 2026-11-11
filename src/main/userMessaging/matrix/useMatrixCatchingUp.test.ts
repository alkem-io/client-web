import { EventEmitter } from 'node:events';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ client: null as unknown, establishing: false, appMode: true }));

vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode: () => harness.appMode }));

vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () => harness.client,
  useMatrixSessionEstablishing: () => harness.establishing,
}));

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
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

/** Sends the app to the background for `awayMs`, then brings it back. */
const resumeAfter = (awayMs: number) => {
  setVisibility('hidden');
  vi.advanceTimersByTime(awayMs);
  setVisibility('visible');
};

describe('useMatrixCatchingUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    harness.client = null;
    harness.establishing = false;
    harness.appMode = true;
  });

  it('is false without a Matrix client', () => {
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(false);
  });

  it('is true while the session is being established, before there is a client', () => {
    harness.establishing = true;
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(true);
  });

  it('is true before the first sync and false once prepared', () => {
    const client = new FakeClient(null);
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(true);

    client.sync('PREPARED');
    expect(result.current).toBe(false);
  });

  it.each(['CATCHUP', 'RECONNECTING'])('is true while the sync state is %s, until it syncs', state => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());
    expect(result.current).toBe(false);

    client.sync(state);
    expect(result.current).toBe(true);

    client.sync('SYNCING');
    expect(result.current).toBe(false);
  });

  it('is false during an outage, which has no bound', () => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());

    client.sync('ERROR');
    expect(result.current).toBe(false);
  });

  it('is true from returning to the foreground after a while away until the next sync', () => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());

    setVisibility('hidden');
    expect(result.current).toBe(false);
    vi.advanceTimersByTime(30_000);

    setVisibility('visible');
    expect(result.current).toBe(true);

    client.sync('SYNCING');
    expect(result.current).toBe(false);
  });

  it('counts time away that began before the client was available', () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    harness.client = new FakeClient('SYNCING');
    const { result } = renderHook(() => useMatrixCatchingUp());

    vi.advanceTimersByTime(30_000);
    setVisibility('visible');
    expect(result.current).toBe(true);
  });

  it('has no foreground window in a browser tab, which keeps syncing in the background', () => {
    harness.appMode = false;
    harness.client = new FakeClient('SYNCING');
    const { result } = renderHook(() => useMatrixCatchingUp());

    resumeAfter(60_000);
    expect(result.current).toBe(false);
  });

  it('stays false after a short time away, when the sync connection was still live', () => {
    harness.client = new FakeClient('SYNCING');
    const { result } = renderHook(() => useMatrixCatchingUp());

    resumeAfter(29_999);
    expect(result.current).toBe(false);
  });

  it('ends the foreground window after the timeout when no sync arrives', () => {
    const client = new FakeClient('SYNCING');
    harness.client = client;
    const { result } = renderHook(() => useMatrixCatchingUp());

    resumeAfter(30_000);
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4_999);
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });
});
