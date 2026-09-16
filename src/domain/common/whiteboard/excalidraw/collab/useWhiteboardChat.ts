import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '@/crd/components/chat/types';
import type { CommentAuthor } from '@/crd/components/comment/types';
import type { ChatMessagePayload } from './awarenessRouter';

/** Client-side cap only (v1 posture, matches the ephemeral transport's own leniency —
 *  see workspace spec 063-whiteboard-chat). Applied both when sending (so a message
 *  never leaves this client oversized) and when receiving (so one outdated/misbehaving
 *  peer can't blow up another client's UI). */
export const WHITEBOARD_CHAT_MESSAGE_MAX_LENGTH = 500;

const formatMessageTimestamp = (epochMs: number): string =>
  new Date(epochMs).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/**
 * Owns the session-chat message list, unread count, and open/closed state for one
 * whiteboard's docked chat rail. Messages are ephemeral (component state only) — never
 * written to the scene doc, never persisted, gone when every participant leaves.
 *
 * `sendChatMessage` is `CollabAPI.sendChatMessage` — its own send is NOT echoed back to
 * this client (the ephemeral relay never echoes to sender), so `sendMessage` appends the
 * optimistic local copy itself before broadcasting, mirroring the fork's own emoji-
 * reaction precedent (`spawnEmoji` in excalidraw-yjs).
 */
export function useWhiteboardChat(sendChatMessage: ((text: string) => void) | undefined, currentUser: CommentAuthor) {
  const [open, setOpenState] = useState(false);
  const openRef = useRef(open);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const setOpen = useCallback((next: boolean) => {
    openRef.current = next;
    setOpenState(next);
    if (next) {
      setUnreadCount(0);
    }
  }, []);

  const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const receiveMessage = useCallback((payload: ChatMessagePayload) => {
    const content = payload.text.slice(0, WHITEBOARD_CHAT_MESSAGE_MAX_LENGTH);
    setMessages(prev => [
      ...prev,
      {
        id: payload.id,
        author: { id: payload.senderId, name: payload.senderName },
        content,
        timestamp: formatMessageTimestamp(payload.timestamp),
        timestampMs: payload.timestamp,
        reactions: [],
        isOwn: false,
      },
    ]);
    if (!openRef.current) {
      setUnreadCount(count => count + 1);
    }
  }, []);

  const sendMessage = useCallback(
    (rawContent: string) => {
      const content = rawContent.trim().slice(0, WHITEBOARD_CHAT_MESSAGE_MAX_LENGTH);
      if (!content) {
        return;
      }
      const now = Date.now();
      setMessages(prev => [
        ...prev,
        {
          id: `local-${now}-${Math.random().toString(36).slice(2)}`,
          author: currentUser,
          content,
          timestamp: formatMessageTimestamp(now),
          timestampMs: now,
          reactions: [],
          isOwn: true,
        },
      ]);
      sendChatMessage?.(content);
    },
    [sendChatMessage, currentUser]
  );

  return { open, toggle, close, unreadCount, messages, sendMessage, receiveMessage };
}
