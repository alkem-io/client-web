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
import useLoadingState from '../../../domain/shared/utils/useLoadingState';

interface Provided {
  loading?: boolean;
  messages?: Message[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
}

const useChatGuidanceCommunication = (): Provided => {
  const { t, i18n } = useTranslation();
  const [askQuestion] = useAskChatGuidanceQuestionMutation();
  const [createGuidanceRoom] = useCreateGuidanceRoomMutation();
  const [resetChatGuidance] = useResetChatGuidanceMutation();

  const { data: roomIdData, loading: roomIdLoading } = useGuidanceRoomIdQuery({});
  const roomId = roomIdData?.me.user?.guidanceRoom?.id;

  const { data: messagesData, loading: messagesLoading } = useGuidanceRoomMessagesQuery({
    variables: {
      roomId: roomId!,
    },
    skip: !roomId,
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
  }, [messagesData?.lookup.room?.messages, roomId, roomIdLoading, messagesLoading]);

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId, !roomId);

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
      refetchQueries: ['GuidanceRoomId'],
      awaitRefetchQueries: true,
    });
  };

  const [clearChat, loadingClearChat] = useLoadingState(async () => {
    await resetChatGuidance({
      refetchQueries: ['GuidanceRoomId'],
      awaitRefetchQueries: true,
    });
  });

  return {
    loading: roomIdLoading || messagesLoading || loadingClearChat,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
  };
};

export default useChatGuidanceCommunication;
