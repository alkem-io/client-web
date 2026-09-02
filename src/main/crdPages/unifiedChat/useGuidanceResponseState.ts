import { useEffect, useRef, useState } from 'react';
import { CHAT_LOADER_TIMEOUT_MS } from '@/main/guidance/chatWidget/constants';
import type { UnifiedConversation } from './dataMapper';

/**
 * Tracks whether we're awaiting a reply from the Guidance assistant, keyed to the
 * guidance conversation itself — NOT the currently-selected one. The guidance
 * conversation's `lastMessage` is kept fresh in the background by the global
 * conversation-events subscription, so the "thinking" state survives navigating
 * to other chats and resolves on its own when the assistant replies. The connector
 * only DISPLAYS the loader while the guidance thread is open (contextual).
 */
export const useGuidanceResponseState = (
  guidanceConversation: UnifiedConversation | undefined,
  currentUserId: string | undefined
) => {
  const [awaiting, setAwaiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const baselineLastMessageIdRef = useRef<string | null>(null);

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAwaiting(false);
  };

  const markSent = () => {
    baselineLastMessageIdRef.current = guidanceConversation?.lastMessage?.id ?? null;
    setAwaiting(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stop, CHAT_LOADER_TIMEOUT_MS);
  };

  // Clear once a NEW message from the assistant (not the current user) lands in
  // the guidance conversation.
  const lastMessage = guidanceConversation?.lastMessage;
  const lastMessageId = lastMessage?.id;
  const lastSenderId = lastMessage?.sender?.id;
  useEffect(() => {
    if (!awaiting || !lastMessageId) {
      return;
    }
    const isNew = lastMessageId !== baselineLastMessageIdRef.current;
    const fromAssistant = !lastSenderId || lastSenderId !== currentUserId;
    if (isNew && fromAssistant) {
      stop();
    }
  }, [awaiting, lastMessageId, lastSenderId, currentUserId]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return { awaiting, markSent };
};
