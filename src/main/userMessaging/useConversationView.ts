import { useEffect, useRef } from 'react';
import { useLeaveConversationMutation, useSendMessageToRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { useMatrixClient } from '@/core/matrix/activeClient';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import { resolveMatrixRoomId } from './matrix/matrixRooms';
import type { UserConversation } from './models';
import type { ConversationMessage } from './useConversationMessages';
import { useIsDocumentActive } from './useIsDocumentActive';

export const useConversationView = (
  conversation: UserConversation | null,
  messages: ConversationMessage[],
  onLeaveConversation?: () => void
) => {
  const [leaveConversation] = useLeaveConversationMutation();
  const [sendMessage, { loading: isSending }] = useSendMessageToRoomMutation();
  const { addReaction, removeReaction } = useCommentReactionsMutations(conversation?.roomId);
  const matrixClient = useMatrixClient();
  const lastMarkedRef = useRef<string | null>(null);
  const isDocumentActive = useIsDocumentActive();

  // Read receipts are gated on the user being genuinely present — the document
  // both visible and focused (FR-018b). This is not cosmetic: the server cancels
  // a pending message digest when the recipient's unread count drops to zero, so
  // an open-but-unattended tab reporting everything as read would silently
  // suppress every notification that user should have received.
  //
  // The marker goes straight to Synapse and sets m.fully_read together with
  // the m.read receipt: the unread count here and the server's digest check
  // both count from m.fully_read, so a receipt alone would leave the
  // conversation unread and its digest email due.
  useEffect(() => {
    if (!isDocumentActive) {
      // Forget what was last reported so RETURNING to a conversation that is
      // still open, with no new message since, marks it read again — the key
      // would otherwise still hold that same last message and block it.
      lastMarkedRef.current = null;
      return;
    }

    if (!matrixClient || !conversation?.roomId || !messages.length) return;

    const lastMessage = messages[messages.length - 1];
    const key = `${conversation.roomId}:${lastMessage.id}`;

    // Still keyed on the last message, so regaining activity marks the visible
    // thread read exactly once rather than on every subsequent re-render.
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    void resolveMatrixRoomId(matrixClient, conversation.roomId)
      .then(matrixRoomId => {
        if (matrixRoomId) {
          return matrixClient.setRoomReadMarkersHttpRequest(matrixRoomId, lastMessage.id, lastMessage.id);
        }
      })
      .catch(_error => {});
  }, [conversation?.roomId, messages, matrixClient, isDocumentActive]);

  const handleLeaveGroup = async () => {
    if (!conversation) return;
    await leaveConversation({
      variables: { leaveData: { conversationID: conversation.id } },
    });
    onLeaveConversation?.();
  };

  const handleSendMessage = async (message: string, attachments?: string[]) => {
    const hasAttachments = Boolean(attachments && attachments.length > 0);
    if (!conversation?.roomId || (!message.trim() && !hasAttachments)) return;

    try {
      await sendMessage({
        variables: {
          messageData: {
            roomID: conversation.roomId,
            message: message.trim(),
            // file-service document ids (feature 013); omitted when none staged.
            attachments: hasAttachments ? attachments : undefined,
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
