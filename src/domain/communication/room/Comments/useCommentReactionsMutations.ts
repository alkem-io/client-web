import type { Reference } from '@apollo/client';
import { useAddReactionMutation, useRemoveReactionMutation } from '@/core/apollo/generated/apollo-hooks';
import useEnsurePresence from '@/core/utils/ensurePresence';

const useCommentReactionsMutations = (roomId: string | undefined) => {
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const ensurePresence = useEnsurePresence();

  const handleAddReaction = ({ emoji, messageId }: { emoji: string; messageId: string }) => {
    const requiredRoomId = ensurePresence(roomId, 'roomId');

    return addReaction({
      variables: {
        emoji,
        messageId,
        roomId: requiredRoomId,
      },
    });
  };

  const handleRemoveReaction = (reactionId: string) => {
    const requiredRoomId = ensurePresence(roomId, 'roomId');

    return removeReaction({
      variables: {
        reactionId,
        roomId: requiredRoomId,
      },
      // Remove the Reaction from cache up front so the UI reflects the removal
      // immediately, regardless of whether room-event subscriptions are active
      // (e.g. forum discussions outside a space context where the room
      // subscription may not deliver the Delete event reliably).
      // Mirrors the subscription Delete handler in useSubscribeOnRoomEvents.
      update: cache => {
        const reactionRefId = cache.identify({ id: reactionId, __typename: 'Reaction' });
        if (!reactionRefId) return;
        const cacheObjects = cache.extract();
        const messageRefIds = Object.keys(cacheObjects).filter(
          key =>
            (cacheObjects[key] as { __typename?: string }).__typename === 'Message' &&
            (cacheObjects[key] as { reactions?: { __ref: string }[] }).reactions?.some(
              ref => ref.__ref === reactionRefId
            )
        );
        for (const messageRefId of messageRefIds) {
          cache.modify({
            id: messageRefId,
            fields: {
              reactions(existing: readonly Reference[] = []) {
                return existing.filter(ref => ref.__ref !== reactionRefId);
              },
            },
          });
        }
        cache.evict({ id: reactionRefId });
        cache.gc();
      },
    });
  };

  return {
    addReaction: handleAddReaction,
    removeReaction: handleRemoveReaction,
  };
};

export default useCommentReactionsMutations;
