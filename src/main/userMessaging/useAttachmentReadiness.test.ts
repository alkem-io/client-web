import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAttachmentReadiness } from './useAttachmentReadiness';

const messages = [
  {
    id: 'event',
    attachments: [
      {
        id: 'media',
        url: 'http://localhost/api/private/rest/storage/file/by-reference?bucketId=bucket&ref=media',
        displayName: 'video.mp4',
      },
    ],
  },
];
describe('attachment readiness after a media error', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does no preflight, then retries the same resource and re-renders once it exists', async () => {
    fetchMock.mockResolvedValueOnce({ status: 404, ok: false }).mockResolvedValueOnce({ status: 200, ok: true });
    const { result } = renderHook(() => useAttachmentReadiness(messages, 'room'));
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current[0].attachments[0].onLoadError?.());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      messages[0].attachments[0].url,
      expect.objectContaining({ method: 'HEAD', credentials: 'include' })
    );
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(result.current[0].attachments[0].retryKey).toBe(1);
    act(() => result.current[0].attachments[0].onLoadError?.());
    await act(() => vi.advanceTimersByTimeAsync(30000));
    expect(fetchMock).toHaveBeenCalledTimes(2); // Decode failures after 200 are terminal.
  });

  it.each([401, 403])('stops immediately on denied status %s', async status => {
    fetchMock.mockResolvedValue({ status, ok: false });
    const { result } = renderHook(() => useAttachmentReadiness(messages, 'room'));
    act(() => result.current[0].attachments[0].onLoadError?.());
    await act(() => vi.advanceTimersByTimeAsync(30000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bounds retries and cancels when room or event leaves the timeline', async () => {
    fetchMock.mockResolvedValue({ status: 404, ok: false });
    const { result, rerender } = renderHook(({ room }) => useAttachmentReadiness(messages, room), {
      initialProps: { room: 'room' },
    });
    act(() => result.current[0].attachments[0].onLoadError?.());
    await act(() => vi.advanceTimersByTimeAsync(30000));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    rerender({ room: 'next-room' });
    act(() => result.current[0].attachments[0].onLoadError?.());
    rerender({ room: 'third-room' });
    await act(() => vi.advanceTimersByTimeAsync(30000));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
