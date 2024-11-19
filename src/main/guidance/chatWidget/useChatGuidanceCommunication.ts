import { useMemo } from 'react';
import {
  useAskChatGuidanceQuestionMutation,
  useCreateGuidanceRoomMutation,
  useGuidanceRoomIdQuery,
  useGuidanceRoomMessagesQuery,
  useResetChatGuidanceMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import useSubscribeOnRoomEvents from '../../../domain/collaboration/callout/useSubscribeOnRoomEvents';
import { Message } from '../../../domain/communication/room/models/Message';
import { buildAuthorFromUser } from '../../../domain/community/user/utils/buildAuthorFromUser';
import { useTranslation } from 'react-i18next';

interface Provided {
  loading?: boolean;
  messages?: Message[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
}

const useChatGuidanceCommunication = ({ skip }: { skip?: boolean }): Provided => {
  const { t, i18n } = useTranslation();
  const [askQuestion] = useAskChatGuidanceQuestionMutation();
  const [createGuidanceRoom] = useCreateGuidanceRoomMutation();
  const [resetChatGuidance] = useResetChatGuidanceMutation();

  const { data: roomIdData, loading: roomIdLoading } = useGuidanceRoomIdQuery({
    skip,
  });
  const roomId = roomIdData?.me.user?.guidanceRoom?.id;

  const { data: messagesData, loading: messagesLoading } = useGuidanceRoomMessagesQuery({
    variables: {
      roomId: roomId!,
    },
    skip: !roomId || skip,
  });

  const messages: Message[] = useMemo(() => {
    const introMessage = {
      id: '__intro',
      createdAt: new Date(),
      reactions: [],
      message: t('chatbot.intro'),
      author: undefined,
    };

    if (messagesData?.lookup.room?.messages.length) {
      return [
        introMessage,
        ...messagesData?.lookup.room?.messages?.map(message => ({
          id: message.id,
          threadID: message.threadID,
          message: message.message,
          author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
          createdAt: new Date(message.timestamp),
          reactions: message.reactions,
        })),
      ];
    } else if (roomIdLoading || messagesLoading) {
      // Return an empty array to avoid showing the intro message while loading
      return [];
    } else {
      // No messages or just no room at all => Return just one message with the intro text
      return [introMessage];
    }
  }, [messagesData, roomId, roomIdLoading, messagesLoading, skip]);

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId, skip);

  const handleSendMessage = async (message: string): Promise<unknown> => {
    if (!roomId) {
      await createGuidanceRoom({
        refetchQueries: ['GuidanceRoomId'],
      });
    }
    return askQuestion({
      variables: {
        chatData: { question: message!, language: i18n.language.toUpperCase() },
      },
      refetchQueries: ['GuidanceRoomId', 'GuidanceRoomMessages'],
    });
  };

  const clearChat = async () => {
    resetChatGuidance({
      refetchQueries: ['GuidanceRoomId'],
    });
  };

  return {
    loading: roomIdLoading || messagesLoading,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
  };
};

export default useChatGuidanceCommunication;
