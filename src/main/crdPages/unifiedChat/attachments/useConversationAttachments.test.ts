import { act, render, renderHook } from '@testing-library/react';
import { createElement, StrictMode, useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useConversationAttachments } from './useConversationAttachments';

const mockFetch = vi.fn();
const mockLegacyUpload = vi.fn();
const roomContext = { roomID: 'room-A' };
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [mockLegacyUpload, { loading: false }],
  useUploadRoomMessageAttachmentMutation: () => [mockLegacyUpload, { loading: false }],
}));

const bucketConfig: StorageConfig = {
  storageBucketId: 'bucket',
  allowedMimeTypes: ['image/png'],
  maxFileSize: 50 * 1024 * 1024,
  canUpload: true,
  temporaryLocation: false,
};
const file = (name: string, type = 'image/png') => new File(['bytes'], name, { type });
const uploadedAttachment = (externalReference: string, displayName = 'a.png') => ({ externalReference, displayName });
const uploadResult = (externalReference: string) => ({
  ok: true,
  status: 201,
  json: async () => ({ mediaId: externalReference, contentUri: `mxc://matrix.test/${externalReference}` }),
});

afterEach(() => vi.unstubAllGlobals());

describe('useConversationAttachments', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
    mockLegacyUpload.mockReset();
  });

  test('selection and removal are local, including under StrictMode', () => {
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext), { wrapper: StrictMode });
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.attachments).toHaveLength(1);
    expect(result.current.accept).toBe('image/png,.png');
    expect(mockFetch).not.toHaveBeenCalled();
    act(() => result.current.removeAttachment(result.current.attachments[0].id));
    expect(result.current.attachments).toHaveLength(0);
  });

  test('no writable bucket means no attachment selection', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, canUpload: false }, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.enabled).toBe(false);
    expect(result.current.attachments).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('validates type, byte size and the count from pending selections', () => {
    const { result } = renderHook(() => useConversationAttachments({ ...bucketConfig, maxFileSize: 10 }, roomContext));
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
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('an explicitly empty MIME allow-list rejects selection', () => {
    const { result } = renderHook(() =>
      useConversationAttachments({ ...bucketConfig, allowedMimeTypes: [] }, roomContext)
    );
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.attachments).toHaveLength(0);
    expect(result.current.error).toBe('comments.attachments.errorUnsupportedType');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test.each([true, false])('after unmount, clears text only when send is confirmed (%s)', async confirmed => {
    let finish!: (confirmed: boolean) => void;
    const sendEvent = vi.fn().mockReturnValue(
      new Promise<boolean>(resolve => {
        finish = resolve;
      })
    );
    const textSent = vi.fn();
    const { result, unmount } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
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
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('streams the unchanged File to the gateway route without an actor header or whole-file read', async () => {
    const selected = file('résumé photo.png');
    const readAll = vi.fn(() => {
      throw new Error('Must not buffer a file');
    });
    Object.defineProperty(selected, 'arrayBuffer', { value: readAll });
    mockFetch.mockResolvedValue(uploadResult('native-media'));
    const sendEvent = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([selected]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(true);
    });
    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      '/api/private/rest/messaging/media/upload?filename=r%C3%A9sum%C3%A9%20photo.png',
      {
        method: 'POST',
        credentials: 'include',
        body: selected,
        headers: { 'Content-Type': 'image/png' },
        signal: expect.any(AbortSignal),
      }
    );
    expect(readAll).not.toHaveBeenCalled();
    expect(sendEvent).toHaveBeenCalledExactlyOnceWith('', uploadedAttachment('native-media', selected.name));
    expect(mockLegacyUpload).not.toHaveBeenCalled();
  });

  test.each([401, 413, 500])('does not publish media after HTTP upload failure %s', async status => {
    mockFetch.mockResolvedValue({ ok: false, status });
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    expect(sendEvent).not.toHaveBeenCalled();
    expect(result.current.error).toBe('comments.attachments.uploadFailed');
    expect(result.current.attachments).toHaveLength(1);
  });

  test('sends text and each uploaded file separately, clearing only confirmed items', async () => {
    mockFetch.mockResolvedValueOnce(uploadResult('first')).mockResolvedValueOnce(uploadResult('second'));
    const sendEvent = vi.fn().mockResolvedValue(true);
    const textSent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png'), file('b.png')]));
    await act(async () => {
      expect(await result.current.send('hello', sendEvent, textSent)).toBe(true);
    });
    expect(sendEvent.mock.calls).toEqual([
      ['hello'],
      ['', uploadedAttachment('first')],
      ['', uploadedAttachment('second', 'b.png')],
    ]);
    expect(textSent).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/private/rest/messaging/media/upload?filename=a.png',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: expect.any(File),
        headers: { 'Content-Type': 'image/png' },
      })
    );
    expect(result.current.attachments).toHaveLength(0);
    expect(mockLegacyUpload).not.toHaveBeenCalled();
  });

  test('second-file failure keeps it and remaining files; retry reuses its upload', async () => {
    mockFetch
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
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png'), file('b.png'), file('c.png')]));
    await act(async () => {
      expect(await result.current.send('hello', sendEvent, textSent)).toBe(false);
    });
    expect(result.current.attachments.map(item => item.name)).toEqual(['b.png', 'c.png']);
    expect(result.current.error).toBe('comments.attachments.sendUnconfirmed');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.current.attachments[0]).toMatchObject({ uploadedAttachment: uploadedAttachment('second', 'b.png') });
    expect(result.current.attachments[0]).not.toHaveProperty('documentId');
    expect(textSent).toHaveBeenCalledTimes(1);
    await act(async () => {
      expect(await result.current.send('', sendEvent, textSent)).toBe(true);
    });
    expect(sendEvent.mock.calls).toEqual([
      ['hello'],
      ['', uploadedAttachment('first')],
      ['', uploadedAttachment('second', 'b.png')],
      ['', uploadedAttachment('second', 'b.png')],
      ['', uploadedAttachment('third', 'c.png')],
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.current.attachments).toHaveLength(0);
    expect(textSent).toHaveBeenCalledTimes(1);
  });

  test('an upload failure stops before media publication and retains the files', async () => {
    mockFetch.mockRejectedValue(new Error('upload unavailable'));
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png'), file('b.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    expect(result.current.attachments.map(item => item.name)).toEqual(['a.png', 'b.png']);
    expect(result.current.error).toBe('comments.attachments.uploadFailed');
    expect(sendEvent).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('unmount aborts the native upload and never publishes its media', async () => {
    let signal!: AbortSignal;
    mockFetch.mockImplementation((_url, options) => {
      signal = options.signal;
      return new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      );
    });
    const sendEvent = vi.fn();
    const { result, unmount } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.send('', sendEvent, vi.fn());
    });
    unmount();
    expect(signal.aborted).toBe(true);
    await expect(pending).resolves.toBe(false);
    expect(sendEvent).not.toHaveBeenCalled();
  });

  test('a successful HTTP response without a media reference is not published or cached', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    expect(sendEvent).not.toHaveBeenCalled();
    expect(result.current.attachments[0].uploadedAttachment).toBeUndefined();
    expect(result.current.error).toBe('comments.attachments.uploadFailed');
  });

  test('busy send rejects another send and selection changes', async () => {
    let finish!: (value: ReturnType<typeof uploadResult>) => void;
    mockFetch.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      })
    );
    const sendEvent = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
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
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(1);
  });

  // Original A→B→A regression: adapted to upload-on-Send and the actual keyed lifetime.
  test('returning to a conversation does not resume its discarded upload draft', async () => {
    let finishFirst!: () => void;
    mockFetch
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishFirst = () => resolve(uploadResult('old-first'));
          })
      )
      .mockResolvedValue(uploadResult('old-second'));
    let current!: ReturnType<typeof useConversationAttachments>;
    function Draft() {
      const draft = useConversationAttachments(bucketConfig, roomContext);
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
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(sendEvent).not.toHaveBeenCalled();
  });
});

describe('completed upload lifetime', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
    mockLegacyUpload.mockReset();
  });

  test('requires an actual room before accepting attachments', () => {
    const { result } = renderHook(() => useConversationAttachments(bucketConfig, undefined));
    act(() => result.current.attachFiles([file('a.png')]));
    expect(result.current.enabled).toBe(false);
    expect(result.current.attachments).toHaveLength(0);
  });

  test('uploads without room/reply context and reuses its reference after definite rejection', async () => {
    mockFetch.mockResolvedValue(uploadResult('reply-file'));
    const sendEvent = vi.fn().mockRejectedValueOnce(new Error('rejected')).mockResolvedValueOnce(true);
    const { result } = renderHook(() =>
      useConversationAttachments(bucketConfig, { roomID: 'room-A', threadID: '$parent' })
    );
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    expect(mockFetch).toHaveBeenCalledExactlyOnceWith(
      '/api/private/rest/messaging/media/upload?filename=a.png',
      expect.objectContaining({ body: expect.any(File), headers: { 'Content-Type': 'image/png' } })
    );
    expect(result.current.attachments[0]).toMatchObject({
      uploadedAttachment: uploadedAttachment('reply-file'),
      status: 'error',
    });
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(true);
    });
    expect(sendEvent.mock.calls).toEqual([
      ['', uploadedAttachment('reply-file')],
      ['', uploadedAttachment('reply-file')],
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('uncertain publication keeps the completed upload and never retries automatically', async () => {
    mockFetch.mockResolvedValue(uploadResult('uncertain-file'));
    const sendEvent = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    rerender();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.attachments[0]).toMatchObject({
      uploadedAttachment: uploadedAttachment('uncertain-file'),
      status: 'error',
    });
    expect(result.current.error).toBe('comments.attachments.sendUnconfirmed');
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test.each([
    { roomID: 'room-B', threadID: '$parent' },
    { roomID: 'room-A', threadID: '$other' },
  ])('never reuses a completed upload after room/reply changes: %j', async nextContext => {
    mockFetch.mockResolvedValue(uploadResult('old-context'));
    const sendEvent = vi.fn().mockResolvedValue(false);
    const { result, rerender } = renderHook(context => useConversationAttachments(bucketConfig, context), {
      initialProps: { roomID: 'room-A', threadID: '$parent' },
    });
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      await result.current.send('', sendEvent, vi.fn());
    });
    rerender(nextContext);
    await act(async () => {
      await result.current.send('', sendEvent, vi.fn());
    });
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('a context change while uploading prevents the old send from publishing', async () => {
    let finish!: (result: ReturnType<typeof uploadResult>) => void;
    mockFetch.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      })
    );
    const sendEvent = vi.fn().mockResolvedValue(true);
    const { result, rerender } = renderHook(context => useConversationAttachments(bucketConfig, context), {
      initialProps: { roomID: 'room-A' },
    });
    act(() => result.current.attachFiles([file('a.png')]));
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.send('', sendEvent, vi.fn());
    });
    const signal = mockFetch.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    rerender({ roomID: 'room-B' });
    expect(signal.aborted).toBe(true);
    await act(async () => {
      finish(uploadResult('old-context'));
      expect(await pending).toBe(false);
    });
    expect(sendEvent).not.toHaveBeenCalled();
    expect(result.current.isSending).toBe(false);
  });

  test('a rejected completed upload never silently uploads again', async () => {
    mockFetch.mockResolvedValue(uploadResult('rejected-file'));
    const sendEvent = vi.fn().mockRejectedValue(new Error('attachment rejected'));
    const { result, rerender } = renderHook(() => useConversationAttachments(bucketConfig, roomContext));
    act(() => result.current.attachFiles([file('a.png')]));
    await act(async () => {
      expect(await result.current.send('', sendEvent, vi.fn())).toBe(false);
    });
    rerender();
    expect(result.current.attachments[0]).toMatchObject({
      uploadedAttachment: uploadedAttachment('rejected-file'),
      status: 'error',
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe('comments.attachments.sendUnconfirmed');
  });
});
