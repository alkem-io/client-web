import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TOKEN_REFRESH_FRACTION, useProactiveTokenRefresh } from './useProactiveTokenRefresh';

// accessTokenTTL is an absolute epoch; pin "now" so a TTL of `now + LIFE` has LIFE ms remaining.
const LIFE = 10_000;
const MIDPOINT = LIFE * TOKEN_REFRESH_FRACTION; // 5000

describe('useProactiveTokenRefresh', () => {
  afterEach(() => vi.useRealTimers());

  it('refreshes at the token lifetime midpoint when the document is already saved', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    renderHook(() => useProactiveTokenRefresh({ accessTokenTTL: LIFE, saved: true, reconnectNonce: 0, onRefresh }));

    act(() => vi.advanceTimersByTime(MIDPOINT - 1));
    expect(onRefresh).not.toHaveBeenCalled(); // not yet at the midpoint
    act(() => vi.advanceTimersByTime(1));
    expect(onRefresh).toHaveBeenCalledTimes(1); // fires exactly at the midpoint
  });

  it('waits for a saved moment before remounting when the document is unsaved at the midpoint', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    const { rerender } = renderHook(props => useProactiveTokenRefresh(props), {
      initialProps: { accessTokenTTL: LIFE, saved: false, reconnectNonce: 0, onRefresh },
    });

    act(() => vi.advanceTimersByTime(MIDPOINT));
    expect(onRefresh).not.toHaveBeenCalled(); // due, but unsaved — hold off to avoid dropping edits

    act(() => rerender({ accessTokenTTL: LIFE, saved: true, reconnectNonce: 0, onRefresh }));
    expect(onRefresh).toHaveBeenCalledTimes(1); // remounts the instant it saves
  });

  it('remounts anyway before expiry if the document never saves (bounded wait)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    renderHook(() => useProactiveTokenRefresh({ accessTokenTTL: LIFE, saved: false, reconnectNonce: 0, onRefresh }));

    // Midpoint reached (5000, unsaved) → bounded fallback = half the remaining life (2500) later.
    act(() => vi.advanceTimersByTime(MIDPOINT));
    expect(onRefresh).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2500));
    expect(onRefresh).toHaveBeenCalledTimes(1); // forced before expiry rather than losing the session
  });

  it('does not arm when there is no valid token TTL', () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    renderHook(() =>
      useProactiveTokenRefresh({ accessTokenTTL: undefined, saved: true, reconnectNonce: 0, onRefresh })
    );
    act(() => vi.advanceTimersByTime(1_000_000));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('never fires for an already-expired token (leaves it to the fallback disconnect)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const onRefresh = vi.fn();
    renderHook(() => useProactiveTokenRefresh({ accessTokenTTL: 5_000, saved: true, reconnectNonce: 0, onRefresh }));
    act(() => vi.advanceTimersByTime(100_000));
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
