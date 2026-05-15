import type { ApolloCache, Reference } from '@apollo/client';

/**
 * Re-derive `Room.messagesCount` from the current length of `Room.messages`.
 *
 * Both the room-events subscription (`useSubscribeOnRoomEvents`) and the
 * post-/reply-/delete-message mutations (`usePostMessageMutations`) need to
 * keep `messagesCount` in sync with `messages` after a write, otherwise the
 * discussion-list count and the detail-page count drift apart (the list
 * shows `messagesCount` from the cached `Room` object; the detail shows
 * `comments.length` from the loaded messages array — same Room entity,
 * different fields).
 *
 * Callers can either pass `buildMessagesCountModifier()` as one of the
 * `fields` on their own `cache.modify` call (preferred when they're already
 * modifying other fields on the same Room — saves a second `cache.modify`
 * round) or call `refreshRoomMessagesCount(cache, roomCacheId)` to do it
 * in one shot.
 */
type CacheModifierDetails = {
  readField: <TField>(field: string) => TField | undefined;
};

export const buildMessagesCountModifier =
  () =>
  (_existing: number | undefined, { readField }: CacheModifierDetails): number => {
    const messages = readField<readonly Reference[]>('messages');
    return messages?.length ?? 0;
  };

export function refreshRoomMessagesCount(cache: ApolloCache<unknown>, roomCacheId: string): void {
  cache.modify({
    id: roomCacheId,
    fields: {
      messagesCount: buildMessagesCountModifier(),
    },
  });
}
