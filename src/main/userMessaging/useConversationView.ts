import type { EventType, MatrixClient, MsgType, RelationType, Room } from 'matrix-js-sdk';
import { useEffect, useRef, useState } from 'react';
import { useLeaveConversationMutation, useSendMessageToRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import type { RoomMessageAttachmentInput } from '@/core/apollo/generated/graphql-schema';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { nativeMatrixId } from './matrix/matrixRooms';
import type { UserConversation } from './models';
import { useIsDocumentActive } from './useIsDocumentActive';

// matrix-js-sdk enum values, as strings so the SDK stays a lazily loaded chunk.
const NOT_SENT = 'not_sent';
const ROOM_MESSAGE = 'm.room.message' as EventType.RoomMessage;
const REACTION = 'm.reaction' as EventType.Reaction;
const TEXT = 'm.text' as MsgType.Text;
const ANNOTATION = 'm.annotation' as RelationType.Annotation;
// Synapse's answer to a second identical reaction from the same user.
const DUPLICATE_ANNOTATION = 'M_DUPLICATE_ANNOTATION';

type TextAttempt = { key: string; txnId: string; discard?: () => void };

const localEcho = (room: Room | null, txnId: string) =>
  room
    ?.getLiveTimeline()
    .getEvents()
    .find(event => event.getTxnId() === txnId);

export const useConversationView = (
  conversation: UserConversation | null,
  /** The newest message-like event of the open thread, rendered or not. */
  readUpToEventId: string | null,
  onLeaveConversation?: () => void
) => {
  const [leaveConversation] = useLeaveConversationMutation();
  const [sendMessage, { loading: isSendingAttachments }] = useSendMessageToRoomMutation();
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const sendingText = useRef(false);
  const pendingText = useRef<TextAttempt | null>(null);
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
      // would otherwise still hold that same newest event and block it.
      lastMarkedRef.current = null;
      return;
    }

    if (!matrixClient || !conversation?.roomId || !readUpToEventId) return;

    const key = `${conversation.roomId}:${readUpToEventId}`;

    // Still keyed on the newest event, so regaining activity marks the visible
    // thread read exactly once rather than on every subsequent re-render.
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    const matrixRoomId = nativeMatrixId(conversation.roomId, '!', matrixClient);
    if (!matrixRoomId) return;
    void matrixClient.setRoomReadMarkersHttpRequest(matrixRoomId, readUpToEventId, readUpToEventId).catch(() => {
      // Not marked: the next run of this effect (a new client after a
      // rejected token, among others) writes it again.
      if (lastMarkedRef.current === key) {
        lastMarkedRef.current = null;
      }
    });
  }, [conversation?.roomId, readUpToEventId, matrixClient, isDocumentActive]);

  const handleLeaveGroup = async () => {
    if (!conversation) return;
    await leaveConversation({
      variables: { leaveData: { conversationID: conversation.id } },
    });
    onLeaveConversation?.();
  };

  const sendDirect = async (
    roomId: string,
    send: (client: MatrixClient, matrixRoomId: string, txnId: string) => Promise<unknown>,
    attempt?: TextAttempt
  ) => {
    if (!matrixClient) {
      throw new Error('No Matrix session');
    }
    const matrixRoomId = nativeMatrixId(roomId, '!', matrixClient);
    if (!matrixRoomId) {
      throw new Error('No Matrix room for the conversation');
    }
    const txnId = attempt?.txnId ?? matrixClient.makeTxnId();
    const room = matrixClient.getRoom(matrixRoomId);
    try {
      const echo = attempt && localEcho(room, txnId);
      if (echo && room) {
        if (echo.status === NOT_SENT) await matrixClient.resendEvent(echo, room);
        return;
      }
      await send(matrixClient, matrixRoomId, txnId);
    } catch (error) {
      const echo = localEcho(room, txnId);
      if (echo?.status === NOT_SENT) {
        if (attempt) {
          // The SDK keeps the transaction registered even after cancel. Retain
          // the hidden echo for resendEvent unless the user changes the message.
          attempt.discard = () => {
            if (echo.status === NOT_SENT) matrixClient.cancelPendingEvent(echo);
          };
        } else {
          matrixClient.cancelPendingEvent(echo);
        }
      }
      throw error;
    }
  };

  const handleSendMessage = async (
    message: string,
    attachmentUpload?: RoomMessageAttachmentInput,
    replyTo?: string
  ) => {
    const text = message.trim();
    if (!conversation?.roomId || (!text && !attachmentUpload)) return;
    const roomId = conversation.roomId;

    try {
      if (attachmentUpload) {
        await sendMessage({
          variables: {
            messageData: {
              roomID: roomId,
              message: text,
              attachmentUpload,
            },
          },
        });
      } else {
        if (!matrixClient || sendingText.current) return false;
        const key = JSON.stringify([matrixClient.getUserId(), matrixClient.getDeviceId(), roomId, text, replyTo]);
        let attempt = pendingText.current;
        if (attempt?.key !== key) {
          attempt?.discard?.();
          attempt = { key, txnId: matrixClient.makeTxnId() };
          pendingText.current = attempt;
        }
        sendingText.current = true;
        setIsSendingDirect(true);
        try {
          const content = {
            msgtype: TEXT,
            body: text,
            ...(replyTo ? { 'm.relates_to': { 'm.in_reply_to': { event_id: replyTo } } } : {}),
          };
          await sendDirect(
            roomId,
            (client, matrixRoomId, txnId) => client.sendEvent(matrixRoomId, ROOM_MESSAGE, content, txnId),
            attempt
          );
          pendingText.current = null;
        } finally {
          sendingText.current = false;
          setIsSendingDirect(false);
        }
      }
      return true;
    } catch (_error) {
      return false;
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
    ).catch((error: unknown) => {
      // The user's own identical reaction already exists — added from another
      // tab or device before this view synced it. What they asked for is in
      // place (sendDirect has dropped this attempt's local echo), and the
      // existing reaction reaches this view with the next sync.
      if ((error as { errcode?: string } | undefined)?.errcode === DUPLICATE_ANNOTATION) return;
      throw error;
    });
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
