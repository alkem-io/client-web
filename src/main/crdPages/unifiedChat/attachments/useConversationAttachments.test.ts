import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useConversationAttachments } from './useConversationAttachments';

const mockUploadFile = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [mockUploadFile, { loading: false }],
}));

const bucketConfig: StorageConfig = {
  storageBucketId: 'bucket-1',
  allowedMimeTypes: ['image/png'],
  maxFileSize: 50 * 1024 * 1024,
  canUpload: true,
  temporaryLocation: true,
};

const makeFile = (name: string, type: string, size = 10): File => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useConversationAttachments', () => {
  beforeEach(() => {
    mockUploadFile.mockReset();
  });

  test('is inert when no storage bucket is available (null config)', async () => {
    const { result } = renderHook(() => useConversationAttachments(undefined));

    expect(result.current.enabled).toBe(false);
    expect(result.current.accept).toBeUndefined();

    await act(async () => {
      await result.current.attachFiles([makeFile('a.png', 'image/png')]);
    });

    // No upload attempted, nothing staged.
    expect(mockUploadFile).not.toHaveBeenCalled();
    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.documentIds).toHaveLength(0);
  });

  test('uploads into the conversation bucket when a writable bucket is supplied', async () => {
    mockUploadFile.mockResolvedValue({ data: { uploadFileOnStorageBucket: { id: 'doc-1', url: 'https://x/doc-1' } } });
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));

    expect(result.current.enabled).toBe(true);
    expect(result.current.accept).toBe('image/png');

    await act(async () => {
      await result.current.attachFiles([makeFile('a.png', 'image/png')]);
    });

    expect(mockUploadFile).toHaveBeenCalledWith({
      variables: { file: expect.any(File), uploadData: { storageBucketId: 'bucket-1', temporaryLocation: true } },
    });
    expect(result.current.documentIds).toEqual(['doc-1']);
    expect(result.current.attachments[0].status).toBe('ready');
  });

  test('a non-writable bucket (canUpload false) keeps the composer inert', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, canUpload: false }));
    expect(result.current.enabled).toBe(false);
  });

  test('drives type validation from the bucket policy', async () => {
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));

    await act(async () => {
      // application/pdf is not in the bucket's allowedMimeTypes -> rejected.
      await result.current.attachFiles([makeFile('b.pdf', 'application/pdf')]);
    });

    expect(mockUploadFile).not.toHaveBeenCalled();
    expect(result.current.error).toBe('comments.attachments.errorUnsupportedType');
  });

  test('removeAttachment re-derives the error (clears a stale upload failure)', async () => {
    mockUploadFile.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));

    await act(async () => {
      await result.current.attachFiles([makeFile('a.png', 'image/png')]);
    });
    expect(result.current.error).toBe('comments.attachments.uploadFailed');
    const stagedId = result.current.attachments[0].id;

    act(() => {
      result.current.removeAttachment(stagedId);
    });

    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.error).toBeUndefined();
  });
});
