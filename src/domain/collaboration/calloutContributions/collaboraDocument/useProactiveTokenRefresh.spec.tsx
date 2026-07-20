import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { REFRESH_LEAD_MS, SAVED_WAIT_MAX_MS, useProactiveTokenRefresh } from './useProactiveTokenRefresh';

// accessTokenTTL is an absolute epoch; pin "now" to 0 so a TTL value = the remaining lifetime.
// Use a token comfortably longer than the refresh lead so the refresh has a window before expiry.
const LIFE = REFRESH_LEAD_MS + 10 * 60_000; // 30 min remaining
const REFRESH_AT = LIFE - REFRESH_LEAD_MS; // fires when REFRESH_LEAD_MS of life is left (10 min in)

describe('useProactiveTokenRefresh', () => {
  afterEach(() => vi.useRealTimers());

  it('refreshes once the remaining life drops to the lead, when already saved', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    renderHook(() => useProactiveTokenRefresh({ accessTokenTTL: LIFE, saved: true, reconnectNonce: 0, onRefresh }));

    act(() => vi.advanceTimersByTime(REFRESH_AT - 1));
    expect(onRefresh).not.toHaveBeenCalled(); // still more than the lead remaining
    act(() => vi.advanceTimersByTime(1));
    expect(onRefresh).toHaveBeenCalledTimes(1); // fires exactly when the lead's worth of life is left
  });

  it('fires before Collabora would warn (~15 min before expiry)', () => {
    // The refresh must land while > ~15 min of life remain; the lead (20 min) guarantees it.
    expect(REFRESH_LEAD_MS).toBeGreaterThan(15 * 60_000);
  });

  it('waits for a saved moment before remounting when unsaved at the due time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    const { rerender } = renderHook(props => useProactiveTokenRefresh(props), {
      initialProps: { accessTokenTTL: LIFE, saved: false, reconnectNonce: 0, onRefresh },
    });

    act(() => vi.advanceTimersByTime(REFRESH_AT));
    expect(onRefresh).not.toHaveBeenCalled(); // due, but unsaved — hold off to avoid dropping edits

    act(() => rerender({ accessTokenTTL: LIFE, saved: true, reconnectNonce: 0, onRefresh }));
    expect(onRefresh).toHaveBeenCalledTimes(1); // remounts the instant it saves
  });

  it('remounts anyway after the bounded grace if the document never saves', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    renderHook(() => useProactiveTokenRefresh({ accessTokenTTL: LIFE, saved: false, reconnectNonce: 0, onRefresh }));

    act(() => vi.advanceTimersByTime(REFRESH_AT));
    expect(onRefresh).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(SAVED_WAIT_MAX_MS));
    expect(onRefresh).toHaveBeenCalledTimes(1); // forced (still ~19 min before expiry, beating the warning)
  });

  it('does not refresh a token whose whole life is within the lead (too short to beat the warning)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onRefresh = vi.fn();
    // 17-min token < 20-min lead → can't refresh before Collabora's warning; leave it to the fallback.
    renderHook(() =>
      useProactiveTokenRefresh({ accessTokenTTL: 17 * 60_000, saved: true, reconnectNonce: 0, onRefresh })
    );
    act(() => vi.advanceTimersByTime(60 * 60_000));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does not arm when there is no valid token TTL', () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    renderHook(() =>
      useProactiveTokenRefresh({ accessTokenTTL: undefined, saved: true, reconnectNonce: 0, onRefresh })
    );
    act(() => vi.advanceTimersByTime(60 * 60_000));
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
