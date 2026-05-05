import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDirtyTabGuard } from './useDirtyTabGuard';

describe('useDirtyTabGuard', () => {
  it('starts clean and returns true immediately for requestSwitch when clean', async () => {
    const { result } = renderHook(() => useDirtyTabGuard());

    expect(result.current.isDirty).toBe(false);

    let allowed: boolean | null = null;
    await act(async () => {
      allowed = await result.current.requestSwitch('about');
    });
    expect(allowed).toBe(true);
    expect(result.current.pendingSwitch).toBeNull();
  });

  it('marks dirty and blocks requestSwitch until resolvePendingSwitch is called', async () => {
    const { result } = renderHook(() => useDirtyTabGuard());

    act(() => {
      result.current.markDirty();
    });
    expect(result.current.isDirty).toBe(true);

    // Start the switch request — it must suspend until we resolve it.
    let resolved: boolean | null = null;
    let switchPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      switchPromise = result.current.requestSwitch('about').then(value => {
        resolved = value;
        return value;
      });
    });

    // While pending, the hook exposes the target tab.
    expect(result.current.pendingSwitch).toBe('about');
    expect(resolved).toBeNull();

    // Resolver = false → switch is denied.
    await act(async () => {
      result.current.resolvePendingSwitch(false);
      await switchPromise;
    });

    expect(resolved).toBe(false);
    expect(result.current.pendingSwitch).toBeNull();
  });

  it('resolving with true allows the switch and leaves dirty unchanged (caller decides when to clear)', async () => {
    const { result } = renderHook(() => useDirtyTabGuard());

    act(() => {
      result.current.markDirty();
    });

    let resolved: boolean | null = null;
    let switchPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      switchPromise = result.current.requestSwitch('templates').then(value => {
        resolved = value;
        return value;
      });
    });

    await act(async () => {
      result.current.resolvePendingSwitch(true);
      await switchPromise;
    });

    expect(resolved).toBe(true);
    // Dirty remains until the caller clears it explicitly; this preserves the
    // ability to short-circuit Save semantics from the consumer.
    expect(result.current.isDirty).toBe(true);
  });

  it('clearDirty flips dirty back to false', () => {
    const { result } = renderHook(() => useDirtyTabGuard());

    act(() => {
      result.current.markDirty();
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.clearDirty();
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('smoke: mounts without a router and does not throw while binding beforeunload', () => {
    const Probe = () => {
      const g = useDirtyTabGuard();
      // Mark dirty so the beforeunload effect fires on the same render.
      if (!g.isDirty) g.markDirty();
      return null;
    };
    expect(() => render(<Probe />)).not.toThrow();
  });
});
