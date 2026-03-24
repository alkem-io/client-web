import { useTranslation } from 'react-i18next';
import {
  useConversationWithGuidanceVcQuery,
  useMarkMessageAsReadMutation,
  useResetConversationVcMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { type ConversationMessage, useConversationMessages } from '@/main/userMessaging/useConversationMessages';
import { useGuidanceVcId } from './useGuidanceVcId';

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
  const { guidanceVcId, loading: guidanceVcIdLoading } = useGuidanceVcId({ skip });
  const { data: conversationGuidanceData, loading: conversationIdLoading } = useConversationWithGuidanceVcQuery({
    skip,
  });
  // Find the guidance VC conversation by matching the concrete well-known guidance VC ID
  const conversation = guidanceVcId
    ? conversationGuidanceData?.me.conversations.conversations.find(conv =>
        conv.members.some(member => member.id === guidanceVcId)
      )
    : undefined;
  const conversationId = conversation?.id ?? null;

  // 2. Use shared hook for messages
  const {
    messages: conversationMessages,
    roomId,
    isLoading: messagesLoading,
  } = useConversationMessages(conversationId);

  // 3. Transform to guidance message format and add intro message
  const messages: GuidanceMessage[] = (() => {
    const introMessage: GuidanceMessage = {
      id: '__intro',
      createdAt: new Date(0), // Earliest possible date so it sorts first
      message: t('chatbot.intro'),
      author: undefined,
    };

    if (conversationMessages.length === 0) {
      return [introMessage];
    }

    const transformedMessages = conversationMessages.map(
      (msg: ConversationMessage): GuidanceMessage => ({
        id: msg.id,
        message: msg.message,
        createdAt: new Date(msg.timestamp),
        author: msg.sender ? { id: msg.sender.id } : undefined,
      })
    );

    return [introMessage, ...transformedMessages];
  })();

  // Compute last message ID separately to avoid handleMarkAsRead recreation on every message change
  const lastMessageId = (() => {
    const lastMsg = conversationMessages[conversationMessages.length - 1];
    return lastMsg?.id;
  })();

  // 4. Subscribe to room events
  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId ?? undefined, !roomId);

  // 5. Mark as read mutation
  const [markMessageAsRead] = useMarkMessageAsReadMutation();

  const handleMarkAsRead = () => {
    if (!roomId || !lastMessageId) {
      return;
    }

    markMessageAsRead({
      variables: {
        messageData: {
          roomID: roomId,
          messageID: lastMessageId,
        },
      },
    });
  };

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
    loading: guidanceVcIdLoading || conversationIdLoading || messagesLoading || loadingClearChat,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,
    conversationId: conversationId ?? '',
  };
};

export default useChatGuidanceCommunication;
