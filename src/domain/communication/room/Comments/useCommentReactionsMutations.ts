import { useAddReactionMutation, useRemoveReactionMutation } from '@/core/apollo/generated/apollo-hooks';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';

const useCommentReactionsMutations = (roomId: string | undefined) => {
  const [addReaction] = useAddReactionMutation({
    onError: () => {
      notify(t('common.error-generic'), 'error');
    },
  });
  const [removeReaction] = useRemoveReactionMutation({
    onError: () => {
      notify(t('common.error-generic'), 'error');
    },
  });
  const ensurePresence = useEnsurePresence();
  const notify = useNotification();
  const { t } = useTranslation();

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
    });
  };

  return {
    addReaction: handleAddReaction,
    removeReaction: handleRemoveReaction,
  };
};

export default useCommentReactionsMutations;
