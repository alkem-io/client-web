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

const batch = (prefix: string, count: number): File[] =>
  Array.from({ length: count }, (_, i) => makeFile(`${prefix}-${i}.png`, 'image/png'));

// Flush pending microtasks + a macrotask so an in-flight upload's continuation
// (chip status update, next loop iteration) commits inside act().
const tick = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
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

  test('clears staged attachments when the selected conversation changes', async () => {
    mockUploadFile.mockResolvedValue({ data: { uploadFileOnStorageBucket: { id: 'doc-A', url: 'https://x/doc-A' } } });
    const { result, rerender } = renderHook(
      ({ conversationId }) => useConversationAttachments(bucketConfig, conversationId),
      { initialProps: { conversationId: 'conv-A' } }
    );

    await act(async () => {
      await result.current.attachFiles([makeFile('a.png', 'image/png')]);
    });
    // Staged against conversation A's bucket.
    expect(result.current.documentIds).toEqual(['doc-A']);
    expect(result.current.attachments).toHaveLength(1);

    // Switching to conversation B must drop the draft so a later send never
    // carries A's bucket document ids.
    act(() => {
      rerender({ conversationId: 'conv-B' });
    });

    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.documentIds).toHaveLength(0);
    expect(result.current.error).toBeUndefined();
  });

  test('rapid back-to-back picks respect the 10-attachment cap', async () => {
    let uploadCount = 0;
    mockUploadFile.mockImplementation(() => {
      uploadCount += 1;
      return Promise.resolve({ data: { uploadFileOnStorageBucket: { id: `doc-${uploadCount}`, url: 'https://x' } } });
    });
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));

    const batch = (prefix: string, count: number) =>
      Array.from({ length: count }, (_, i) => makeFile(`${prefix}-${i}.png`, 'image/png'));

    // Two picks fired back-to-back before a re-render: 6 then 6 = 12 requested,
    // but the count cap reads the live ref, so only 10 are accepted in total.
    await act(async () => {
      await Promise.all([
        result.current.attachFiles(batch('first', 6)),
        result.current.attachFiles(batch('second', 6)),
      ]);
    });

    expect(result.current.attachments).toHaveLength(10);
    expect(result.current.documentIds).toHaveLength(10);
    expect(result.current.error).toBe('comments.attachments.errorTooMany');
  });

  test('removing a chip mid-batch keeps the count cap honest for a later pick', async () => {
    // Deferred uploads so chips are added one iteration at a time and we can
    // remove an already-added chip while later files in the same batch are still
    // in flight (the reservation-drift scenario).
    const resolvers: Array<(id: string) => void> = [];
    mockUploadFile.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvers.push(id => resolve({ data: { uploadFileOnStorageBucket: { id, url: 'https://x' } } }));
        })
    );
    const resolveNext = async (id: string): Promise<void> => {
      const resolve = resolvers.shift();
      resolve?.(id);
      await tick();
    };

    const { result } = renderHook(() => useConversationAttachments(bucketConfig));

    // Start a 6-file batch; only the first chip is added before it awaits.
    act(() => {
      void result.current.attachFiles(batch('a', 6));
    });
    await tick();
    expect(result.current.attachments).toHaveLength(1);

    // Let a-0 finish uploading; a-1's chip is now added too.
    await resolveNext('doc-a0');
    expect(result.current.attachments).toHaveLength(2);

    // Remove a-0 while a-2..a-5 are still to be added by the same batch. The old
    // code reset the count ref to the current length (1), discarding the four
    // not-yet-added reservations.
    act(() => {
      result.current.removeAttachment(result.current.attachments[0].id);
    });
    expect(result.current.attachments).toHaveLength(1);

    // Drain the remaining uploads (a-1..a-5).
    await resolveNext('doc-a1');
    await resolveNext('doc-a2');
    await resolveNext('doc-a3');
    await resolveNext('doc-a4');
    await resolveNext('doc-a5');
    expect(result.current.attachments).toHaveLength(5);

    // A later pick of 6 must accept only 5 to reach — but not exceed — the cap of
    // 10. With the drift bug the ref was 1, so all 6 would have been accepted.
    mockUploadFile.mockImplementation(() =>
      Promise.resolve({ data: { uploadFileOnStorageBucket: { id: 'doc-b', url: 'https://x' } } })
    );
    await act(async () => {
      await result.current.attachFiles(batch('b', 6));
    });

    expect(result.current.attachments).toHaveLength(10);
    expect(result.current.error).toBe('comments.attachments.errorTooMany');
  });

  test('a stale upload rejection from a previous conversation is not surfaced in the new one', async () => {
    let rejectA: (reason?: unknown) => void = () => {};
    mockUploadFile.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectA = reject;
        })
    );
    const { result, rerender } = renderHook(
      ({ conversationId }) => useConversationAttachments(bucketConfig, conversationId),
      { initialProps: { conversationId: 'conv-A' } }
    );

    // Stage a file in conversation A; its upload stays in flight.
    act(() => {
      void result.current.attachFiles([makeFile('a.png', 'image/png')]);
    });
    await tick();
    expect(result.current.attachments).toHaveLength(1);

    // Switch to conversation B — the draft (and refs) reset.
    act(() => {
      rerender({ conversationId: 'conv-B' });
    });
    expect(result.current.attachments).toHaveLength(0);

    // A's upload now rejects. It must NOT repaint conversation B's composer with
    // a spurious "upload failed" error.
    await act(async () => {
      rejectA(new Error('boom'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.attachments).toHaveLength(0);
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
