import { useResetConversationVcMutation } from '@/core/apollo/generated/apollo-hooks';
import type { ConversationMessage } from '@/main/userMessaging/useConversationMessages';
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
  messages: ConversationMessage[],
  onLeaveConversation?: () => void
) => {
  const base = useConversationView(conversation, messages, onLeaveConversation);
  const [resetConversationVc] = useResetConversationVcMutation();

  const clearGuidance = async (conversationId: string) => {
    await resetConversationVc({
      variables: { input: { conversationID: conversationId } },
      // Unified list is driven by UserConversations, so refresh it too (research D6).
      refetchQueries: ['UserConversations', 'ConversationMessages', 'ConversationWithGuidanceVc'],
      awaitRefetchQueries: true,
    });
  };

  return { ...base, clearGuidance };
};
