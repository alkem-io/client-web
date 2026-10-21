import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { projectMessages } from './matrix/matrixEvents';
import { useConversationMessages } from './useConversationMessages';

const fixture = vi.hoisted(() => ({ messages: [] as ReturnType<typeof projectMessages>, resolver: vi.fn() }));
vi.mock('@apollo/client', () => ({ useApolloClient: () => ({ query: fixture.resolver }) }));
vi.mock('./matrix/useConversationTimeline', () => ({
  useConversationTimeline: () => ({ messages: fixture.messages, readUpToEventId: '$image', isLoading: false }),
}));
vi.mock('./matrix/useActorProfiles', () => ({ useActorProfiles: () => new Map() }));

const conversation = {
  id: 'conversation',
  roomId: 'room',
  attachmentBucketId: 'bucket-A',
  members: [{ id: 'alice', type: ActorType.User, displayName: 'Alice' }],
};
const media = () =>
  projectMessages(
    [
      {
        eventId: '$image',
        type: 'm.room.message',
        sender: '@alice:matrix.example',
        timestamp: 1,
        content: {
          msgtype: 'm.image',
          url: 'mxc://matrix.example/media-1',
          body: 'caption',
          filename: 'résumé.png',
          info: { mimetype: 'image/png', size: 123, w: 640, h: 480 },
          'io.alkemio.document_id': '0b4f1c2e-7a3d-4e5f-8a9b-1c2d3e4f5a6b',
        },
      },
    ],
    'matrix.example'
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  fixture.resolver.mockReset();
});

describe('native conversation attachment integration', () => {
  it('renders event metadata at the direct bucket/reference URL with no resolver or eager probe', () => {
    fixture.messages = media();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { result, rerender } = renderHook(
      ({ bucket }) => useConversationMessages({ ...conversation, attachmentBucketId: bucket }),
      {
        initialProps: { bucket: 'bucket-A' },
      }
    );
    expect(result.current.messages[0].attachments[0]).toMatchObject({
      id: 'media-1',
      displayName: 'résumé.png',
      mimeType: 'image/png',
      size: 123,
      width: 640,
      height: 480,
      url: `${window.location.origin}/api/private/rest/storage/file/by-reference?bucketId=bucket-A&ref=media-1`,
    });
    rerender({ bucket: 'bucket-B' });
    expect(result.current.messages[0].attachments[0].url).toContain('bucketId=bucket-B&ref=media-1');
    expect(fixture.resolver).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reuses resource readiness only after a native media-load error', async () => {
    vi.useFakeTimers();
    fixture.messages = media();
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    const { result } = renderHook(() => useConversationMessages(conversation));
    expect(fetch).not.toHaveBeenCalled();
    act(() => result.current.messages[0].attachments[0].onLoadError?.());
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${window.location.origin}/api/private/rest/storage/file/by-reference?bucketId=bucket-A&ref=media-1`,
      expect.objectContaining({ method: 'HEAD', credentials: 'include' })
    );
    expect(result.current.messages[0].attachments[0].retryKey).toBe(1);
    expect(fixture.resolver).not.toHaveBeenCalled();
  });
});
