import { useEffect, useRef, useState } from 'react';
import { useResetConversationVcMutation } from '@/core/apollo/generated/apollo-hooks';
import { CHAT_LOADER_TIMEOUT_MS } from '@/main/guidance/chatWidget/constants';
import type { ConversationMessage } from '@/main/userMessaging/useConversationMessages';
import { useConversationView } from '@/main/userMessaging/useConversationView';
import type { UnifiedConversation } from './dataMapper';

/**
 * Wraps the generic `useConversationView` (send / leave / reactions / mark-read)
 * and adds the Guidance-specific behaviors: the "thinking" wait window (a loader
 * + disabled input until the assistant replies or the timeout elapses) and
 * clear-context (`resetConversationVc`).
 */
export const useUnifiedConversationView = (
  conversation: UnifiedConversation | null,
  messages: ConversationMessage[],
  currentUserId: string | undefined,
  onLeaveConversation?: () => void
) => {
  const base = useConversationView(conversation, messages, onLeaveConversation);
  const [resetConversationVc] = useResetConversationVcMutation();

  const isGuidance = conversation?.isGuidance ?? false;
  const [isAwaitingGuidanceResponse, setIsAwaitingGuidanceResponse] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitingRef = useRef(false);

  const stopWaiting = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    waitingRef.current = false;
    setIsAwaitingGuidanceResponse(false);
  };

  // The assistant replied (a non-user message arrived) — stop the loader.
  useEffect(() => {
    if (!waitingRef.current || messages.length === 0) {
      return;
    }
    const last = messages[messages.length - 1];
    const fromAssistant = !last.sender || last.sender.id !== currentUserId;
    if (fromAssistant) {
      stopWaiting();
    }
  }, [messages, currentUserId]);

  useEffect(() => () => stopWaiting(), []);

  const handleSendMessage = async (message: string) => {
    if (!isGuidance) {
      return base.handleSendMessage(message);
    }

    stopWaiting();
    waitingRef.current = true;
    setIsAwaitingGuidanceResponse(true);
    timeoutRef.current = setTimeout(() => {
      stopWaiting();
    }, CHAT_LOADER_TIMEOUT_MS);

    try {
      return await base.handleSendMessage(message);
    } catch (error) {
      stopWaiting();
      throw error;
    }
  };

  const clearGuidance = async (conversationId: string) => {
    await resetConversationVc({
      variables: { input: { conversationID: conversationId } },
      // Unified list is driven by UserConversations, so refresh it too (research D6).
      refetchQueries: ['UserConversations', 'ConversationMessages', 'ConversationWithGuidanceVc'],
      awaitRefetchQueries: true,
    });
    stopWaiting();
  };

  return {
    ...base,
    handleSendMessage,
    isAwaitingGuidanceResponse,
    clearGuidance,
  };
};
