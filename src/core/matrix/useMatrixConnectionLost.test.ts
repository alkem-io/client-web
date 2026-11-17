import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setSyncState } from './activeClient';
import { CONNECTION_LOST_DELAY_MS, useMatrixConnectionLost } from './useMatrixConnectionLost';

describe('useMatrixConnectionLost', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setSyncState('SYNCING');
  });
  afterEach(() => {
    setSyncState(null);
    vi.useRealTimers();
  });

  it('stays hidden for a short ERROR that recovers before the delay', () => {
    const { result } = renderHook(() => useMatrixConnectionLost());
    act(() => setSyncState('ERROR'));
    act(() => vi.advanceTimersByTime(CONNECTION_LOST_DELAY_MS - 1000));
    act(() => setSyncState('SYNCING'));
    act(() => vi.advanceTimersByTime(CONNECTION_LOST_DELAY_MS));
    expect(result.current).toBe(false);
  });

  it('shows after a sustained ERROR/RECONNECTING and hides on recovery', () => {
    const { result } = renderHook(() => useMatrixConnectionLost());
    act(() => setSyncState('ERROR'));
    act(() => vi.advanceTimersByTime(CONNECTION_LOST_DELAY_MS - 1));
    expect(result.current).toBe(false);
    act(() => setSyncState('RECONNECTING'));
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
    act(() => setSyncState('PREPARED'));
    expect(result.current).toBe(false);
  });

  it('keeps the notice through a stalled CATCHUP without restarting the delay', () => {
    const { result } = renderHook(() => useMatrixConnectionLost());
    act(() => setSyncState('ERROR'));
    act(() => vi.advanceTimersByTime(CONNECTION_LOST_DELAY_MS - 1));
    act(() => setSyncState('CATCHUP'));
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
    act(() => setSyncState('SYNCING'));
    expect(result.current).toBe(false);
  });
});
