import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCollaboraRecovery } from './useCollaboraRecovery';

describe('useCollaboraRecovery', () => {
  it('performs immediately when nothing is at risk (no warning)', () => {
    const perform = vi.fn();
    const { result } = renderHook(() => useCollaboraRecovery(false, perform));

    act(() => result.current.request('reconnect'));

    expect(perform).toHaveBeenCalledTimes(1);
    expect(perform).toHaveBeenCalledWith('reconnect');
    expect(result.current.pending).toBeNull();
  });

  it('holds the action behind a warning when changes are at risk', () => {
    const perform = vi.fn();
    const { result } = renderHook(() => useCollaboraRecovery(true, perform));

    act(() => result.current.request('reload'));

    expect(perform).not.toHaveBeenCalled(); // gated — not performed yet
    expect(result.current.pending).toBe('reload');
    expect(result.current.kind).toBe('reload'); // drives the action-specific copy
  });

  it('performs the pending action on confirm and clears the warning', () => {
    const perform = vi.fn();
    const { result } = renderHook(() => useCollaboraRecovery(true, perform));

    act(() => result.current.request('reconnect'));
    act(() => result.current.confirm());

    expect(perform).toHaveBeenCalledTimes(1);
    expect(perform).toHaveBeenCalledWith('reconnect');
    expect(result.current.pending).toBeNull();
  });

  it('cancel dismisses the warning without acting', () => {
    const perform = vi.fn();
    const { result } = renderHook(() => useCollaboraRecovery(true, perform));

    act(() => result.current.request('reload'));
    act(() => result.current.cancel());

    expect(perform).not.toHaveBeenCalled();
    expect(result.current.pending).toBeNull();
  });

  it('confirm is a no-op when nothing is pending', () => {
    const perform = vi.fn();
    const { result } = renderHook(() => useCollaboraRecovery(true, perform));

    act(() => result.current.confirm());

    expect(perform).not.toHaveBeenCalled();
  });

  it('kind falls back to reconnect while idle (dialog closing)', () => {
    const { result } = renderHook(() => useCollaboraRecovery(true, vi.fn()));

    expect(result.current.pending).toBeNull();
    expect(result.current.kind).toBe('reconnect');
  });
});
