import { useCallback, useMemo } from 'react';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  useConversationWithGuidanceVcQuery,
  useMarkMessageAsReadMutation,
  useResetConversationVcMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useConversationMessages, ConversationMessage } from '@/main/userMessaging/useConversationMessages';

// Message format expected by ChatWidgetInner
interface GuidanceMessage {
  id: string;
  message: string;
  createdAt: Date;
  author?: { id: string };
}

interface Provided {
  loading?: boolean;
  messages?: GuidanceMessage[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  markAsRead: () => void;
  isSubscribedToMessages: boolean;
  conversationId: string;
}

const useChatGuidanceCommunication = ({ skip = false }): Provided => {
  const { t } = useTranslation();

  // 1. Get guidance conversation ID
  const { data: conversationGuidanceData, loading: conversationIdLoading } = useConversationWithGuidanceVcQuery({
    skip,
  });
  const conversation = conversationGuidanceData?.me.conversations.conversationGuidanceVc;
  const conversationId = conversation?.id ?? null;

  // 2. Use shared hook for messages
  const { messages: conversationMessages, roomId, isLoading: messagesLoading } = useConversationMessages(conversationId);

  // 3. Transform to guidance message format and add intro message
  const messages: GuidanceMessage[] = useMemo(() => {
    const introMessage: GuidanceMessage = {
      id: '__intro',
      createdAt: new Date(0), // Earliest possible date so it sorts first
      message: t('chatbot.intro'),
      author: undefined,
    };

    if (conversationMessages.length === 0) {
      return [introMessage];
    }

    const transformedMessages = conversationMessages.map((msg: ConversationMessage): GuidanceMessage => ({
      id: msg.id,
      message: msg.message,
      createdAt: new Date(msg.timestamp),
      author: msg.sender ? { id: msg.sender.id } : undefined,
    }));

    return [introMessage, ...transformedMessages];
  }, [conversationMessages, t]);

  // 4. Subscribe to room events
  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId ?? undefined, !roomId);

  // 5. Mark as read mutation
  const [markMessageAsRead] = useMarkMessageAsReadMutation();

  const handleMarkAsRead = useCallback(() => {
    const realMessages = messages.filter(m => m.id !== '__intro');
    const lastMessage = realMessages[realMessages.length - 1];

    if (!roomId || !lastMessage) {
      return;
    }

    markMessageAsRead({
      variables: {
        messageData: {
          roomID: roomId,
          messageID: lastMessage.id,
        },
      },
    });
  }, [roomId, messages, markMessageAsRead]);

  // 6. Send message mutation
  const [sendMessageToRoom] = useSendMessageToRoomMutation();

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!roomId) {
      return;
    }

    await sendMessageToRoom({
      variables: {
        messageData: {
          roomID: roomId,
          message,
        },
      },
    });
  };

  // 7. Reset conversation mutation (guidance-specific)
  const [resetConversationVc] = useResetConversationVcMutation();

  const [clearChat, loadingClearChat] = useLoadingState(async () => {
    if (!conversationId) {
      return;
    }

    await resetConversationVc({
      variables: {
        input: {
          conversationID: conversationId,
        },
      },
      refetchQueries: ['ConversationWithGuidanceVc', 'ConversationMessages'],
      awaitRefetchQueries: true,
    });
  });

  return {
    loading: conversationIdLoading || messagesLoading || loadingClearChat,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,
    conversationId: conversationId ?? '',
  };
};

export default useChatGuidanceCommunication;
