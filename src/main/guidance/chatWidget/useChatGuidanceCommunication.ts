import { useMemo } from 'react';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { Message } from '@/domain/communication/room/models/Message';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  MessageDetailsFragmentDoc,
  useConversationVcMessagesQuery,
  useConversationWithGuidanceVcQuery,
  useResetConversationVcMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';

interface Provided {
  loading?: boolean;
  messages?: Message[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
  conversationId: string;
}

const useChatGuidanceCommunication = ({ skip = false }): Provided => {
  const { t } = useTranslation();

  const [resetConversationVc] = useResetConversationVcMutation();

  const { data: conversationGuidanceData, loading: conversationIdLoading } = useConversationWithGuidanceVcQuery({
    skip,
  });
  const conversation = conversationGuidanceData?.me.conversations.conversationGuidanceVc;
  const conversationId = conversation?.id;
  const roomId = conversation?.room?.id;

  const { data: messagesData, loading: messagesLoading } = useConversationVcMessagesQuery({
    variables: {
      conversationId: conversationId!,
    },
    skip: !conversationId,
  });

  const messages: Message[] = useMemo(() => {
    const introMessage = {
      id: '__intro',
      createdAt: new Date(),
      reactions: [],
      message: t('chatbot.intro'),
      author: undefined,
    };
    const room = messagesData?.lookup.conversation?.room;

    if (room?.messages?.length) {
      return [
        introMessage,
        ...room.messages.map(message => ({
          id: message.id,
          threadID: message.threadID,
          message: message.message,
          author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
          createdAt: new Date(message.timestamp),
          reactions: message.reactions,
        })),
      ];
    } else {
      // No messages or just no room at all => Return just one message with the intro text
      return [introMessage];
    }
  }, [messagesData?.lookup.conversation?.room?.messages, conversationId, conversationIdLoading, messagesLoading]);

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId, !roomId);

  const [sendMessageToRoom] = useSendMessageToRoomMutation({
    update: (cache, { data }) => {
      if (isSubscribedToMessages || !data?.sendMessageToRoom) {
        return;
      }

      const cacheRoomId = cache.identify({
        id: roomId,
        __typename: 'Room',
      });

      if (!cacheRoomId) {
        return;
      }

      cache.modify({
        id: cacheRoomId,
        fields: {
          messages(existingMessages = []) {
            const newMessage = cache.writeFragment({
              data: data.sendMessageToRoom,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

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
      refetchQueries: ['ConversationWithGuidanceVc', 'ConversationVcMessages'],
      awaitRefetchQueries: true,
    });
  });

  return {
    loading: conversationIdLoading || messagesLoading || loadingClearChat,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
    conversationId: conversationId!,
  };
};

export default useChatGuidanceCommunication;
