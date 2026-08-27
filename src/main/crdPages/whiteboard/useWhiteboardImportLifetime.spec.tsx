import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWhiteboardImportLifetime } from './useWhiteboardImportLifetime';

const pendingSourceLoad = (signal: AbortSignal) =>
  new Promise<never>((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('source load aborted')), { once: true });
  });

describe('useWhiteboardImportLifetime', () => {
  it('cancels a source load as soon as the dialog closes', async () => {
    const { result, rerender } = renderHook(({ active }) => useWhiteboardImportLifetime('whiteboard-A', active), {
      initialProps: { active: true },
    });
    const token = result.current.beginImport();
    const loading = pendingSourceLoad(token.signal);

    rerender({ active: false });

    await expect(loading).rejects.toThrow('source load aborted');
    expect(token.isCancelled()).toBe(true);
  });

  it('cancels a source load when the dialog unmounts', async () => {
    const { result, unmount } = renderHook(() => useWhiteboardImportLifetime('whiteboard-A', true));
    const token = result.current.beginImport();
    const loading = pendingSourceLoad(token.signal);

    unmount();

    await expect(loading).rejects.toThrow('source load aborted');
    expect(token.isCancelled()).toBe(true);
  });

  it('cancels A during the A→B gap without waiting for editor B to publish its API', async () => {
    const { result, rerender } = renderHook(({ whiteboardId }) => useWhiteboardImportLifetime(whiteboardId, true), {
      initialProps: { whiteboardId: 'whiteboard-A' },
    });
    const tokenA = result.current.beginImport();
    const loadingA = pendingSourceLoad(tokenA.signal);

    // No replacement editor/API callback occurs here: changing the owning identity
    // itself must synchronously invalidate the old import generation.
    rerender({ whiteboardId: 'whiteboard-B' });

    await expect(loadingA).rejects.toThrow('source load aborted');
    expect(tokenA.isCancelled()).toBe(true);
    const tokenB = result.current.beginImport();
    expect(tokenB.signal.aborted).toBe(false);
    expect(tokenB.isCancelled()).toBe(false);
  });
});
