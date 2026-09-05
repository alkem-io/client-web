import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMemoSigningFlow } from './useMemoSigningFlow';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
};

describe('useMemoSigningFlow', () => {
  it('shows preparation immediately and waits for durability before asking the server to render', async () => {
    const durability = deferred<void>();
    const order: string[] = [];
    const requestDurability = vi.fn(async () => {
      order.push('durability');
      await durability.promise;
    });
    const prepare = vi.fn(async () => {
      order.push('prepare');
      return { attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' };
    });
    const { result } = renderHook(() =>
      useMemoSigningFlow({ memoId: 'memo-1', requestDurability, prepare, continueSigning: vi.fn(), navigate: vi.fn() })
    );

    let preparation!: Promise<void>;
    act(() => {
      preparation = result.current.prepare();
    });
    expect(result.current.stage).toBe('preparing');
    expect(prepare).not.toHaveBeenCalled();

    await act(async () => {
      durability.resolve();
      await preparation;
    });
    expect(order).toEqual(['durability', 'prepare']);
    expect(result.current.stage).toBe('preview');
    expect(result.current.attempt).toEqual({ attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' });
  });

  it('does not claim the exact copy was prepared when offline durability fails', async () => {
    const prepare = vi.fn();
    const { result } = renderHook(() =>
      useMemoSigningFlow({
        memoId: 'memo-1',
        requestDurability: () => Promise.reject(new Error('offline')),
        prepare,
        continueSigning: vi.fn(),
        navigate: vi.fn(),
      })
    );

    await act(() => result.current.prepare());

    expect(result.current.stage).toBe('prepare-error');
    expect(prepare).not.toHaveBeenCalled();
  });

  it('continues the prepared attempt once and performs a full browser navigation', async () => {
    const authorization = deferred<string>();
    const continueSigning = vi.fn(() => authorization.promise);
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useMemoSigningFlow({
        memoId: 'memo-1',
        requestDurability: vi.fn(),
        prepare: () => Promise.resolve({ attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' }),
        continueSigning,
        navigate,
      })
    );

    await act(() => result.current.prepare());
    let first!: Promise<void>;
    let duplicate!: Promise<void>;
    act(() => {
      first = result.current.continueSigning();
      duplicate = result.current.continueSigning();
    });
    expect(result.current.stage).toBe('continuing');
    expect(continueSigning).toHaveBeenCalledTimes(1);
    expect(continueSigning).toHaveBeenCalledWith('attempt-1');

    await act(async () => {
      authorization.resolve('https://cleverbase.example/authorize');
      await Promise.all([first, duplicate]);
    });
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('https://cleverbase.example/authorize');
  });

  it('surfaces a consumed continuation failure without navigating', async () => {
    const continueSigning = vi.fn(() => Promise.reject(new Error('gateway unavailable')));
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useMemoSigningFlow({
        memoId: 'memo-1',
        requestDurability: vi.fn(),
        prepare: () => Promise.resolve({ attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' }),
        continueSigning,
        navigate,
      })
    );

    await act(() => result.current.prepare());
    await act(() => result.current.continueSigning());

    expect(result.current.stage).toBe('continue-error');
    expect(navigate).not.toHaveBeenCalled();
  });
});
