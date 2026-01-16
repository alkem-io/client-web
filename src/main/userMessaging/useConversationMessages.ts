import { useConversationMessagesQuery } from '@/core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import { ConversationMessage, mapMessageSender } from './models';

export type { ConversationMessage } from './models';

export const useConversationMessages = (conversationId: string | null) => {
  const { data, loading, error } = useConversationMessagesQuery({
    variables: { conversationId: conversationId! },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const messages = useMemo<ConversationMessage[]>(() => {
    const roomMessages = data?.lookup?.conversation?.room?.messages;
    if (!roomMessages) {
      return [];
    }

    return roomMessages
      .map(msg => ({
        id: msg.id,
        message: msg.message,
        timestamp: msg.timestamp,
        sender: mapMessageSender(msg.sender),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data?.lookup?.conversation?.room?.messages]);

  const roomId = data?.lookup?.conversation?.room?.id ?? null;

  return {
    messages,
    roomId,
    isLoading: loading,
    error,
  };
};
