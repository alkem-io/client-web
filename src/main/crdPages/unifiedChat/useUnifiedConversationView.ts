import { useResetConversationVcMutation } from '@/core/apollo/generated/apollo-hooks';
import { useConversationView } from '@/main/userMessaging/useConversationView';
import type { UnifiedConversation } from './dataMapper';

/**
 * Wraps the generic `useConversationView` (send / leave / reactions / mark-read)
 * and adds Guidance clear-context (`resetConversationVc`). The "thinking" wait
 * state lives in `useGuidanceResponseState` instead — keyed to the guidance
 * conversation so it survives navigation rather than the selected conversation.
 */
export const useUnifiedConversationView = (
  conversation: UnifiedConversation | null,
  readUpToEventId: string | null,
  onLeaveConversation?: () => void
) => {
  const base = useConversationView(conversation, readUpToEventId, onLeaveConversation);
  const [resetConversationVc] = useResetConversationVcMutation();

  const clearGuidance = async (conversationId: string) => {
    await resetConversationVc({
      variables: { input: { conversationID: conversationId } },
      // Unified list is driven by UserConversations, so refresh it too (research D6).
      refetchQueries: ['UserConversations', 'ConversationWithGuidanceVc'],
      awaitRefetchQueries: true,
    });
  };

  return { ...base, clearGuidance };
};
