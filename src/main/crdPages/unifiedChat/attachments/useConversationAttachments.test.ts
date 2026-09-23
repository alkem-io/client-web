import { act, render, renderHook } from '@testing-library/react';
import { createElement, StrictMode, useLayoutEffect } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useConversationAttachments } from './useConversationAttachments';

const mockUploadFile = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [mockUploadFile, { loading: false }],
}));

const bucketConfig: StorageConfig = {
  storageBucketId: 'bucket',
  allowedMimeTypes: ['image/png'],
  maxFileSize: 50 * 1024 * 1024,
  canUpload: true,
  temporaryLocation: false,
};
const file = (name: string, type = 'image/png') => new File(['bytes'], name, { type });
const uploadResult = (id: string) => ({ data: { uploadFileOnStorageBucket: { id } } });

describe('useConversationAttachments', () => {
  beforeEach(() => {
    mockUploadFile.mockReset();
  });

  test('selection and removal are local, including under StrictMode', () => {
    const { result } = renderHook(() => useConversationAttachments(bucketConfig), { wrapper: StrictMode });
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.attachments).toHaveLength(1);
    expect(result.current.accept).toBe('image/png,.png');
    expect(mockUploadFile).not.toHaveBeenCalled();
    act(() => result.current.removeAttachment(result.current.attachments[0].id));
    expect(result.current.attachments).toHaveLength(0);
  });

  test('no writable bucket means no attachment selection', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, canUpload: false }));
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.enabled).toBe(false);
    expect(result.current.attachments).toHaveLength(0);
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test('validates type, byte size and the count from pending selections', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, maxFileSize: 10 }));
    act(() => result.current.attachFiles([file('a.pdf', 'application/pdf')]));
    expect(result.current.error).toBe('comments.attachments.errorUnsupportedType');
    act(() => result.current.attachFiles([new File(['a'.repeat(11)], 'large.png', { type: 'image/png' })]));
    expect(result.current.error).toBe('comments.attachments.errorTooLarge');
    act(() => {
      result.current.attachFiles(Array.from({ length: 6 }, (_, i) => file(`a${i}.png`)));
      result.current.attachFiles(Array.from({ length: 6 }, (_, i) => file(`b${i}.png`)));
    });
    expect(result.current.attachments).toHaveLength(10);
    expect(result.current.error).toBe('comments.attachments.errorTooMany');
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test('an explicitly empty MIME allow-list rejects selection', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, allowedMimeTypes: [] }));
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.error).toBe('comments.attachments.errorUnsupportedType');
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test.each([true, false])('after unmount, clears text only when send is confirmed (%s)', async confirmed => {
    let finish!: (confirmed: boolean) => void;
    const sendEvent = vi.fn().mockReturnValue(
      new Promise<boolean>(resolve => {
        finish = resolve;
      })
    );
    const textSent = vi.fn();
    const { result, unmount } = renderHook(() => useConversationAttachments(bucketConfig));
    act(() => result.current.attachFiles([file('a.png')]));
    let sending!: Promise<boolean>;
    act(() => {
      sending = result.current.send('hello', sendEvent, textSent);
    });
    unmount();
    await act(async () => {
      finish(confirmed);
      expect(await sending).toBe(false);
    });
    expect(textSent).toHaveBeenCalledTimes(confirmed ? 1 : 0);
    expect(sendEvent).toHaveBeenCalledExactlyOnceWith('hello');
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test('sends text and each uploaded file separately, clearing only confirmed items', async () => {
    mockUploadFile.mockResolvedValueOnce(uploadResult('first')).mockResolvedValueOnce(uploadResult('second'));
    const sendEvent = vi.fn().mockResolvedValue(true);
    const textSent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));
    act(() => result.current.attachFiles([file('a.png'), file('b.png')]));
    await act(async () => {
      expect(await result.current.send('hello', sendEvent, textSent)).toBe(true);
    });
    expect(sendEvent.mock.calls).toEqual([['hello'], ['', ['first']], ['', ['second']]]);
    expect(textSent).toHaveBeenCalledTimes(1);
    expect(mockUploadFile).toHaveBeenCalledWith({
      variables: { file: expect.any(File), uploadData: { storageBucketId: 'bucket', temporaryLocation: false } },
    });
    expect(result.current.attachments).toHaveLength(0);
  });

  test('second-file failure keeps it and remaining files; retry reuses its upload', async () => {
    mockUploadFile
      .mockResolvedValueOnce(uploadResult('first'))
      .mockResolvedValueOnce(uploadResult('second'))
      .mockResolvedValueOnce(uploadResult('third'));
    const sendEvent = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);
    const textSent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));
    act(() => result.current.attachFiles([file('a.png'), file('b.png'), file('c.png')]));
    await act(async () => {
      expect(await result.current.send('hello', sendEvent, textSent)).toBe(false);
    });
    expect(result.current.attachments.map(item => item.name)).toEqual(['b.png', 'c.png']);
    expect(result.current.error).toBe('comments.attachments.sendUnconfirmed');
    expect(mockUploadFile).toHaveBeenCalledTimes(2);
    expect(textSent).toHaveBeenCalledTimes(1);
    await act(async () => {
      expect(await result.current.send('', sendEvent, textSent)).toBe(true);
    });
    expect(sendEvent.mock.calls).toEqual([
      ['hello'],
      ['', ['first']],
      ['', ['second']],
      ['', ['second']],
      ['', ['third']],
    ]);
    expect(mockUploadFile).toHaveBeenCalledTimes(3);
    expect(result.current.attachments).toHaveLength(0);
    expect(textSent).toHaveBeenCalledTimes(1);
  });

  test('an upload failure stops before media publication and retains the files', async () => {
    mockUploadFile.mockRejectedValue(new Error('upload unavailable'));
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));
    act(() => result.current.attachFiles([file('a.png'), file('b.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    expect(result.current.attachments.map(item => item.name)).toEqual(['a.png', 'b.png']);
    expect(result.current.error).toBe('comments.attachments.uploadFailed');
    expect(sendEvent).not.toHaveBeenCalled();
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
  });

  test('busy send rejects another send and selection changes', async () => {
    let finish!: (value: ReturnType<typeof uploadResult>) => void;
    mockUploadFile.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      })
    );
    const sendEvent = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useConversationAttachments(bucketConfig));
    act(() => result.current.attachFiles([file('a.png')]));
    let sending!: Promise<boolean>;
    act(() => {
      sending = result.current.send('', sendEvent, vi.fn());
    });
    act(() => {
      result.current.removeAttachment(result.current.attachments[0].id);
      result.current.attachFiles([file('b.png')]);
    });
    expect(result.current.attachments.map(item => item.name)).toEqual(['a.png']);
    expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    await act(async () => {
      finish(uploadResult('first'));
      await sending;
    });
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(1);
  });

  // Original A→B→A regression: adapted to upload-on-Send and the actual keyed lifetime.
  test('returning to a conversation does not resume its discarded upload draft', async () => {
    let finishFirst!: () => void;
    mockUploadFile
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishFirst = () => resolve(uploadResult('old-first'));
          })
      )
      .mockResolvedValue(uploadResult('old-second'));
    let current!: ReturnType<typeof useConversationAttachments>;
    function Draft() {
      const draft = useConversationAttachments(bucketConfig);
      useLayoutEffect(() => {
        current = draft;
      }, [draft]);
      return null;
    }
    const view = render(createElement(Draft, { key: 'conv-A' }));
    const sendEvent = vi.fn().mockResolvedValue(true);
    act(() => current.attachFiles([file('old-1.png'), file('old-2.png')]));
    let sending!: Promise<boolean>;
    act(() => {
      sending = current.send('', sendEvent, vi.fn());
    });
    view.rerender(createElement(Draft, { key: 'conv-B' }));
    view.rerender(createElement(Draft, { key: 'conv-A' }));
    await act(async () => {
      finishFirst();
      await sending;
    });
    expect(current.attachments).toHaveLength(0);
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
