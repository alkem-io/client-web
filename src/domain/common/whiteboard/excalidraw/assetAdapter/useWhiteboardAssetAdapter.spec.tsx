import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { useWhiteboardAssetAdapter } from './useWhiteboardAssetAdapter';

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
    expect(mockUpload).toHaveBeenCalledWith({
      variables: { file: expect.any(File), uploadData: { storageBucketId: 'sb-1' } },
    });
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

  it('returns a STABLE assetAdapter identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useWhiteboardAssetAdapter({ storageBucketId: 'sb-1' }));
    const first = result.current.assetAdapter;
    rerender();
    rerender();
    expect(result.current.assetAdapter).toBe(first);
  });
});
