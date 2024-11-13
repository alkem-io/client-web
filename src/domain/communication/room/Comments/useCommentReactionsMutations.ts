import { useAddReactionMutation, useRemoveReactionMutation } from '@core/apollo/generated/apollo-hooks';
import ensurePresence from '@core/utils/ensurePresence';

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
    });
  };

  const handleRemoveReaction = (reactionId: string) => {
    const requiredRoomId = ensurePresence(roomId);

    return removeReaction({
      variables: {
        reactionId,
        roomId: requiredRoomId,
      },
    });
  };

  return {
    addReaction: handleAddReaction,
    removeReaction: handleRemoveReaction,
  };
};

export default useCommentReactionsMutations;
