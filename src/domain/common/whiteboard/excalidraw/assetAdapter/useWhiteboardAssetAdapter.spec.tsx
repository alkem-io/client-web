import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { UPLOAD_TIMEOUT_MESSAGE, UPLOAD_TIMEOUT_MS, useWhiteboardAssetAdapter } from './useWhiteboardAssetAdapter';

const mockUpload = vi.fn();
const mockFetchDoc = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [mockUpload],
  useWhiteboardAssetDocumentLazyQuery: () => [mockFetchDoc],
}));

const mockFetchFileToDataURL = vi.fn(
  async (_url: string, _headers?: Record<string, string>) => 'data:image/png;base64,BBBB'
);
vi.mock('../fileStore/fileConverters', () => ({
  dataUrlToFile: vi.fn(async (_dataUrl: string, name: string) => new File(['x'], name, { type: 'image/png' })),
  fetchFileToDataURL: (url: string, headers?: Record<string, string>) => mockFetchFileToDataURL(url, headers),
}));

const FILE = { id: 'f1', dataURL: 'data:image/png;base64,AAAA', mimeType: 'image/png', created: 1 } as never;

const guestWrapper =
  (guestName: string | null) =>
  ({ children }: { children: ReactNode }) => (
    <GuestSessionContext.Provider value={{ guestName } as never}>{children}</GuestSessionContext.Provider>
  );

describe('useWhiteboardAssetAdapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('store uploads the bytes to the bucket and returns the document id as the locator', async () => {
    mockUpload.mockResolvedValue({ data: { uploadFileOnStorageBucket: { id: 'doc-1', url: 'http://ignored' } } });
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

    let locator = '';
    await act(async () => {
      locator = await result.current.assetAdapter.store(FILE);
    });

    expect(locator).toBe('doc-1');
    expect(mockUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { file: expect.any(File), uploadData: { storageBucketId: 'sb-1' } },
      })
    );
    expect(result.current.uploadError).toBeUndefined();
  });

  it('store throws and records uploadError when the upload returns no id', async () => {
    mockUpload.mockResolvedValue({ data: { uploadFileOnStorageBucket: null } });
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

    await act(async () => {
      await expect(result.current.assetAdapter.store(FILE)).rejects.toThrow();
    });
    expect(result.current.uploadError).toBeDefined();
  });

  it('(gate 10) emits a FRESH error object per failure — two identical failures are distinct events', async () => {
    mockUpload.mockResolvedValue({ data: { uploadFileOnStorageBucket: null } }); // always "no id"
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

    await act(async () => {
      await expect(result.current.assetAdapter.store(FILE)).rejects.toThrow();
    });
    const first = result.current.uploadError;
    expect(first).toBeDefined();

    await act(async () => {
      await expect(result.current.assetAdapter.store(FILE)).rejects.toThrow();
    });
    const second = result.current.uploadError;

    // Same message, but a DISTINCT object identity → a host effect keyed on it re-fires on
    // the second failure (string state would bail on the identical value and drop the 2nd notify).
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
    expect(second?.message).toBe(first?.message);
  });

  it('resolve looks up the document url by locator and returns the fetched bytes', async () => {
    mockFetchDoc.mockResolvedValue({
      data: { lookup: { document: { id: 'doc-1', url: 'http://x/doc', mimeType: 'image/png' } } },
    });
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

    let file: { id: string; dataURL: string; mimeType: string } | undefined;
    await act(async () => {
      file = (await result.current.assetAdapter.resolve('f1' as never, 'doc-1')) as never;
    });

    expect(mockFetchDoc).toHaveBeenCalledWith({ variables: { documentId: 'doc-1' } });
    expect(file?.id).toBe('f1');
    expect(file?.dataURL).toBe('data:image/png;base64,BBBB');
    expect(file?.mimeType).toBe('image/png');
    // no guest header when there is no guest session
    expect(mockFetchFileToDataURL).toHaveBeenCalledWith('http://x/doc', {});
  });

  it('resolve throws and records resolveError when the locator has no document', async () => {
    mockFetchDoc.mockResolvedValue({ data: { lookup: { document: null } } });
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

    await act(async () => {
      await expect(result.current.assetAdapter.resolve('f1' as never, 'missing')).rejects.toThrow();
    });
    expect(result.current.resolveError).toBeDefined();
  });

  it('resolve sends the base64 x-guest-name header for a guest session', async () => {
    mockFetchDoc.mockResolvedValue({
      data: { lookup: { document: { id: 'd', url: 'http://x/doc', mimeType: 'image/png' } } },
    });
    const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }), {
      wrapper: guestWrapper('Alice'),
    });

    await act(async () => {
      await result.current.assetAdapter.resolve('f1' as never, 'doc-1');
    });
    expect(mockFetchFileToDataURL).toHaveBeenCalledWith('http://x/doc', { 'x-guest-name': encodeToBase64('Alice') });
  });

  // ── T030 F1: the store upload is bounded by a host timeout ────────────────
  // A hung upload must never leave `store` pending forever — it would stall the
  // flush-gated save/close. Fake timers drive the deadline deterministically.

  it('(gate 1) a never-settling upload rejects at the deadline and aborts the fetch signal', async () => {
    vi.useFakeTimers();
    try {
      let capturedSignal: AbortSignal | undefined;
      mockUpload.mockImplementation((opts: { context?: { fetchOptions?: { signal?: AbortSignal } } }) => {
        capturedSignal = opts.context?.fetchOptions?.signal;
        return new Promise(() => {}); // never settles — a hung transport
      });
      const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

      await act(async () => {
        const store = result.current.assetAdapter.store(FILE);
        const rejects = expect(store).rejects.toThrow(UPLOAD_TIMEOUT_MESSAGE);
        await vi.advanceTimersByTimeAsync(UPLOAD_TIMEOUT_MS);
        await rejects;
      });

      expect(capturedSignal?.aborted).toBe(true);
      expect(result.current.uploadError?.message).toBe(UPLOAD_TIMEOUT_MESSAGE);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(gate 2) a transport that ignores the abort signal still settles via the timer race', async () => {
    vi.useFakeTimers();
    try {
      // The mock observes the signal but deliberately never rejects on abort —
      // proving the timer race, not the signal, is what guarantees settlement.
      mockUpload.mockImplementation((opts: { context?: { fetchOptions?: { signal?: AbortSignal } } }) => {
        opts.context?.fetchOptions?.signal?.addEventListener('abort', () => {
          /* ignored on purpose */
        });
        return new Promise(() => {});
      });
      const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

      await act(async () => {
        const store = result.current.assetAdapter.store(FILE);
        const rejects = expect(store).rejects.toThrow(UPLOAD_TIMEOUT_MESSAGE);
        await vi.advanceTimersByTimeAsync(UPLOAD_TIMEOUT_MS);
        await rejects;
      });

      expect(result.current.uploadError?.message).toBe(UPLOAD_TIMEOUT_MESSAGE);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(gate 3) a success before the deadline clears the timer, never aborts, and returns the id', async () => {
    vi.useFakeTimers();
    try {
      let capturedSignal: AbortSignal | undefined;
      mockUpload.mockImplementation((opts: { context?: { fetchOptions?: { signal?: AbortSignal } } }) => {
        capturedSignal = opts.context?.fetchOptions?.signal;
        return Promise.resolve({ data: { uploadFileOnStorageBucket: { id: 'doc-fast' } } });
      });
      const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

      let locator = '';
      await act(async () => {
        locator = await result.current.assetAdapter.store(FILE);
      });
      expect(locator).toBe('doc-fast');
      expect(capturedSignal?.aborted).toBe(false);

      // Advancing well past the deadline must NOT abort — the timer was cleared.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(UPLOAD_TIMEOUT_MS + 1_000);
      });
      expect(capturedSignal?.aborted).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(gate 4) a store retry after a timeout succeeds — no permanent failure cache', async () => {
    vi.useFakeTimers();
    try {
      mockUpload.mockImplementationOnce(() => new Promise(() => {})); // first attempt hangs
      const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

      await act(async () => {
        const store = result.current.assetAdapter.store(FILE);
        const rejects = expect(store).rejects.toThrow(UPLOAD_TIMEOUT_MESSAGE);
        await vi.advanceTimersByTimeAsync(UPLOAD_TIMEOUT_MS);
        await rejects;
      });
      expect(result.current.uploadError?.message).toBe(UPLOAD_TIMEOUT_MESSAGE);

      // Retry: the next attempt resolves normally and clears the error.
      mockUpload.mockResolvedValueOnce({ data: { uploadFileOnStorageBucket: { id: 'doc-retry' } } });
      let locator = '';
      await act(async () => {
        locator = await result.current.assetAdapter.store(FILE);
      });
      expect(locator).toBe('doc-retry');
      expect(result.current.uploadError).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('(gate 6) a late upload resolution AFTER the deadline cannot become a success', async () => {
    vi.useFakeTimers();
    try {
      let resolveUpload: ((v: unknown) => void) | undefined;
      mockUpload.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveUpload = resolve;
          })
      );
      const { result } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));

      let store!: Promise<string>;
      await act(async () => {
        store = result.current.assetAdapter.store(FILE);
        const rejects = expect(store).rejects.toThrow(UPLOAD_TIMEOUT_MESSAGE);
        await vi.advanceTimersByTimeAsync(UPLOAD_TIMEOUT_MS);
        await rejects;
      });
      expect(result.current.uploadError?.message).toBe(UPLOAD_TIMEOUT_MESSAGE);

      // The server resolves LATE — after the store already rejected. The race has
      // settled, so this can neither flip the result nor clear the error (no locator).
      await act(async () => {
        resolveUpload?.({ data: { uploadFileOnStorageBucket: { id: 'late-doc' } } });
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(result.current.uploadError?.message).toBe(UPLOAD_TIMEOUT_MESSAGE);
      await expect(store).rejects.toThrow(UPLOAD_TIMEOUT_MESSAGE);
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns a STABLE assetAdapter identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));
    const first = result.current.assetAdapter;
    rerender();
    rerender();
    expect(result.current.assetAdapter).toBe(first);
  });
});
