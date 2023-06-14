import {
  ReactionDetailsFragmentDoc,
  useAddReactionMutation,
  useRemoveReactionMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import ensurePresence from '../../../../core/utils/ensurePresence';

const useCommentReactionsMutations = (roomId: string | undefined) => {
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const handleAddReaction = ({ emoji, messageId }: { emoji: string; messageId: string }) => {
    const requiredRoomId = ensurePresence(roomId);

    return addReaction({
      variables: {
        emoji,
        messageId,
        roomId: requiredRoomId,
      },
      update: (cache, { data }) => {
        // TODO: When Subscriptions to Reactions are enable we need to add a check here
        if (!data) {
          return;
        }

        const { addReactionToMessageInRoom: reaction } = data;

        const messageRefId = cache.identify({
          __typename: 'Message',
          id: messageId,
        });

        if (!messageRefId) {
          return;
        }

        cache.modify({
          id: messageRefId,
          fields: {
            reactions(existingReactions = []) {
              const newReactionRef = cache.writeFragment({
                data: reaction,
                fragment: ReactionDetailsFragmentDoc,
                fragmentName: 'ReactionDetails',
              });
              return [...existingReactions, newReactionRef];
            },
          },
        });
      },
    });
  };

  // TODO: Temporarily using messageId to delete a reaction from a message in the cache
  // When subscriptions are in place we can remove this parameter
  const handleRemoveReaction = (reactionId: string, messageId: string) => {
    const requiredRoomId = ensurePresence(roomId);

    return removeReaction({
      variables: {
        reactionId,
        roomId: requiredRoomId,
      },
      update: (cache, { data }) => {
        // TODO: When Subscriptions to Reactions are enable we need to add a check here
        if (!data) {
          return;
        }

        const reactionRefId = cache.identify({
          __typename: 'Reaction',
          id: reactionId,
        });

        const messageRefId = cache.identify({
          __typename: 'Message',
          id: messageId,
        });

        if (!messageRefId) {
          return;
        }

        cache.modify({
          id: messageRefId,
          fields: {
            reactions(existingReactions = []) {
              return existingReactions.filter(reaction => reaction.__ref !== reactionRefId);
            },
          },
        });
      },
    });
  };

  return {
    addReaction: handleAddReaction,
    removeReaction: handleRemoveReaction,
  };
};

export default useCommentReactionsMutations;
