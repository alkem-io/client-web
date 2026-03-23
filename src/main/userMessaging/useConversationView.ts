import { useEffect, useRef } from 'react';
import {
  useLeaveConversationMutation,
  useMarkMessageAsReadMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import type { ConversationMessage } from './useConversationMessages';
import type { UserConversation } from './useUserConversations';

export const useConversationView = (
  conversation: UserConversation | null,
  messages: ConversationMessage[],
  onLeaveConversation?: () => void
) => {
  const [leaveConversation] = useLeaveConversationMutation();
  const [sendMessage, { loading: isSending }] = useSendMessageToRoomMutation();
  const { addReaction, removeReaction } = useCommentReactionsMutations(conversation?.roomId);
  useSubscribeOnRoomEvents(conversation?.roomId, !conversation);
  const [markAsRead] = useMarkMessageAsReadMutation();
  const lastMarkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversation?.roomId || !messages.length) return;

    const lastMessage = messages[messages.length - 1];
    const key = `${conversation.roomId}:${lastMessage.id}`;

    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    markAsRead({
      variables: {
        messageData: {
          roomID: conversation.roomId,
          messageID: lastMessage.id,
        },
      },
    }).catch(_error => {});
  }, [conversation?.roomId, messages, markAsRead]);

  const handleLeaveGroup = async () => {
    if (!conversation) return;
    await leaveConversation({
      variables: { leaveData: { conversationID: conversation.id } },
    });
    onLeaveConversation?.();
  };

  const handleSendMessage = async (message: string) => {
    if (!conversation?.roomId || !message.trim()) return;

    try {
      await sendMessage({
        variables: {
          messageData: {
            roomID: conversation.roomId,
            message: message.trim(),
          },
        },
      });
      return true;
    } catch (_error) {
      return false;
    }
  };

  const handleAddReaction = (messageId: string) => (emoji: string) => {
    if (!conversation?.roomId) return;
    return addReaction({ emoji, messageId });
  };

  const handleRemoveReaction = (reactionId: string) => {
    if (!conversation?.roomId) return;
    return removeReaction(reactionId);
  };

  return {
    isSending,
    handleLeaveGroup,
    handleSendMessage,
    handleAddReaction,
    handleRemoveReaction,
  };
};
