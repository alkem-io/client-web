import { useMemo, useState } from 'react';
import {
  AskChatGuidanceQuestionMutationOptions,
  useAskChatGuidanceQuestionMutation,
  useCreateGuidanceRoomMutation,
  useGuidanceRoomIdQuery,
  useGuidanceRoomMessagesQuery,
  useResetChatGuidanceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { Message } from '@/domain/communication/room/models/Message';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

interface Provided {
  loading?: boolean;
  messages?: Message[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
}

const useChatGuidanceCommunication = ({ skip = false }): Provided => {
  const { t, i18n } = useTranslation();

  const [createGuidanceRoom] = useCreateGuidanceRoomMutation();
  const [resetChatGuidance] = useResetChatGuidanceMutation();

  const [sendingFirstMessage, setSendingFirstMessage] = useState<boolean>(false);

  const {
    data: roomIdData,
    loading: roomIdLoading,
    refetch: refetchGuidanceRoomId,
  } = useGuidanceRoomIdQuery({
    skip,
  });
  const roomId = roomIdData?.me.user?.guidanceRoom?.id;

  const { data: messagesData, loading: messagesLoading } = useGuidanceRoomMessagesQuery({
    variables: {
      roomId: roomId!,
    },
    skip: !roomId || sendingFirstMessage,
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
    } else {
      // No messages or just no room at all => Return just one message with the intro text
      return [introMessage];
    }
  }, [messagesData?.lookup.room?.messages, roomId, sendingFirstMessage, roomIdLoading, messagesLoading]);

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId, !roomId);

  const [askChatGuidanceQuestion] = useAskChatGuidanceQuestionMutation();
  const askQuestion = async (
    question: string,
    refetchQueries?: AskChatGuidanceQuestionMutationOptions['refetchQueries']
  ) =>
    askChatGuidanceQuestion({
      variables: {
        chatData: { question, language: i18n.language.toUpperCase() },
      },
      refetchQueries,
      awaitRefetchQueries: true,
    });

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!roomId) {
      setSendingFirstMessage(true);
      await createGuidanceRoom({
        refetchQueries: ['GuidanceRoomId', 'GuidanceRoomMessages'],
      });
      await askQuestion(message);
      setSendingFirstMessage(false);
    } else {
      await askQuestion(message, ['GuidanceRoomMessages']);
    }
  };

  const [clearChat, loadingClearChat] = useLoadingState(async () => {
    await resetChatGuidance();
    await refetchGuidanceRoomId();
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
