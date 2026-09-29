import type { EventType, MatrixClient, MsgType, RelationType } from 'matrix-js-sdk';
import { useEffect, useRef, useState } from 'react';
import { useLeaveConversationMutation, useSendMessageToRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { resolveMatrixRoomId } from './matrix/matrixRooms';
import type { UserConversation } from './models';
import type { ConversationMessage } from './useConversationMessages';
import { useIsDocumentActive } from './useIsDocumentActive';

// matrix-js-sdk enum values, as strings so the SDK stays a lazily loaded chunk.
const NOT_SENT = 'not_sent';
const ROOM_MESSAGE = 'm.room.message' as EventType.RoomMessage;
const REACTION = 'm.reaction' as EventType.Reaction;
const TEXT = 'm.text' as MsgType.Text;
const ANNOTATION = 'm.annotation' as RelationType.Annotation;

export const useConversationView = (
  conversation: UserConversation | null,
  messages: ConversationMessage[],
  onLeaveConversation?: () => void
) => {
  const [leaveConversation] = useLeaveConversationMutation();
  const [sendMessage, { loading: isSendingAttachments }] = useSendMessageToRoomMutation();
  const [isSendingDirect, setIsSendingDirect] = useState(false);
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

  // Sends straight to Synapse and resolves once the server has accepted the
  // event. A rejected send leaves no local echo behind in the timeline.
  const sendDirect = async (
    roomId: string,
    send: (client: MatrixClient, matrixRoomId: string, txnId: string) => Promise<unknown>
  ) => {
    if (!matrixClient) {
      throw new Error('No Matrix session');
    }
    const matrixRoomId = await resolveMatrixRoomId(matrixClient, roomId);
    if (!matrixRoomId) {
      throw new Error('No Matrix room for the conversation');
    }
    const txnId = matrixClient.makeTxnId();
    try {
      await send(matrixClient, matrixRoomId, txnId);
    } catch (error) {
      const echo = matrixClient
        .getRoom(matrixRoomId)
        ?.getPendingEvents()
        .find(event => event.getTxnId() === txnId);
      if (echo?.status === NOT_SENT) {
        matrixClient.cancelPendingEvent(echo);
      }
      throw error;
    }
  };

  const handleSendMessage = async (message: string, attachments?: string[]) => {
    const hasAttachments = Boolean(attachments && attachments.length > 0);
    const text = message.trim();
    if (!conversation?.roomId || (!text && !hasAttachments)) return;
    const roomId = conversation.roomId;

    try {
      if (hasAttachments) {
        await sendMessage({
          variables: {
            messageData: {
              roomID: roomId,
              message: text,
              // file-service document ids (feature 013).
              attachments,
            },
          },
        });
      } else {
        setIsSendingDirect(true);
        await sendDirect(roomId, (client, matrixRoomId, txnId) =>
          client.sendEvent(matrixRoomId, ROOM_MESSAGE, { msgtype: TEXT, body: text }, txnId)
        );
      }
      return true;
    } catch (_error) {
      return false;
    } finally {
      setIsSendingDirect(false);
    }
  };

  const handleAddReaction = (messageId: string) => (emoji: string) => {
    if (!conversation?.roomId) return;
    return sendDirect(conversation.roomId, (client, matrixRoomId, txnId) =>
      client.sendEvent(
        matrixRoomId,
        REACTION,
        { 'm.relates_to': { rel_type: ANNOTATION, event_id: messageId, key: emoji } },
        txnId
      )
    );
  };

  // The reaction id is the Matrix reaction event id, and only the user's own
  // reaction is ever removed, so this is a plain self-redaction.
  const handleRemoveReaction = (reactionId: string) => {
    if (!conversation?.roomId) return;
    return sendDirect(conversation.roomId, (client, matrixRoomId, txnId) =>
      client.redactEvent(matrixRoomId, reactionId, txnId)
    );
  };

  return {
    isSending: isSendingAttachments || isSendingDirect,
    handleLeaveGroup,
    handleSendMessage,
    handleAddReaction,
    handleRemoveReaction,
  };
};
