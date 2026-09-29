import { InMemoryCache } from '@apollo/client';
import { describe, expect, test } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { MessageCacheFragment, toMessageCachePayload } from './useConversationEventsSubscription';

/**
 * The realtime path writes an incoming Message into the normalized cache with
 * `MessageCacheFragment` + `toMessageCachePayload`. Both sides must cover every
 * field the message-reading documents select, and a gap on either side is
 * completely silent at runtime — Apollo just stores an incomplete entity.
 *
 * Feature 013 added `attachments` to every `Room.messages` selection but not to
 * this fragment, so realtime messages arrived with their media stripped and
 * attachments only appeared after a refetch. These tests round-trip through a
 * real `InMemoryCache` so either omission fails.
 */

// Shaped exactly like the `messageReceived.message` selection in
// `ConversationEvents.graphql`, __typename included (Apollo adds it to every
// selection, so the subscription payload really does carry these).
const incomingMessage = {
  __typename: 'Message' as const,
  id: 'msg-1',
  message: '',
  timestamp: 1700000000000,
  sender: {
    __typename: 'Actor' as const,
    id: 'user-1',
    type: ActorType.User,
    profile: {
      __typename: 'Profile' as const,
      id: 'profile-1',
      displayName: 'Ada Lovelace',
      avatar: { __typename: 'Visual' as const, id: 'visual-1', uri: 'https://alkem.io/avatar.png' },
    },
  },
  reactions: [],
  attachments: [
    {
      __typename: 'MessageAttachment' as const,
      id: 'doc-1',
      url: 'https://alkem.io/storage/document/doc-1',
      displayName: 'photo.png',
      mimeType: 'image/png',
      size: 2048,
      width: 800,
      height: 600,
    },
  ],
};

const roundTrip = (message: typeof incomingMessage) => {
  const cache = new InMemoryCache();
  cache.writeFragment({ data: toMessageCachePayload(message), fragment: MessageCacheFragment });
  return cache.readFragment<{
    id: string;
    attachments: { id: string; url: string; mimeType: string; width?: number; height?: number }[];
  }>({
    id: cache.identify({ __typename: 'Message', id: message.id }) ?? '',
    fragment: MessageCacheFragment,
  });
};

describe('realtime message cache write', () => {
  test('a realtime message keeps its attachments when written to the cache', () => {
    const cached = roundTrip(incomingMessage);

    // A null read means the cached entity is missing a field the fragment
    // selects — i.e. the write was incomplete.
    expect(cached).not.toBeNull();
    expect(cached?.attachments).toEqual([
      expect.objectContaining({
        id: 'doc-1',
        url: 'https://alkem.io/storage/document/doc-1',
        displayName: 'photo.png',
        mimeType: 'image/png',
        size: 2048,
        width: 800,
        height: 600,
      }),
    ]);
  });

  test('a realtime message with no attachments round-trips as an empty list', () => {
    const cached = roundTrip({ ...incomingMessage, attachments: [] });

    expect(cached).not.toBeNull();
    expect(cached?.attachments).toEqual([]);
  });
});
