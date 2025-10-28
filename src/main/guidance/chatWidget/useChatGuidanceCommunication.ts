import { useMemo } from 'react';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { Message } from '@/domain/communication/room/models/Message';
import { buildAuthorFromUser } from '@/domain/community/user/utils/buildAuthorFromUser';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  AskVirtualContributorQuestionMutationOptions,
  useAskVirtualContributorQuestionMutation,
  useConversationVcMessagesQuery,
  useConversationWithGuidanceVcQuery,
  useResetConversationVcMutation,
} from '@/core/apollo/generated/apollo-hooks';

interface Provided {
  loading?: boolean;
  messages?: Message[];
  clearChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
}

const useChatGuidanceCommunication = ({ skip = false }): Provided => {
  const { t, i18n } = useTranslation();

  const [resetCConversationVc] = useResetConversationVcMutation();

  const { data: conversationGuidanceData, loading: conversationIdLoading } = useConversationWithGuidanceVcQuery({
    skip,
  });
  const conversationId = conversationGuidanceData?.me.conversations.conversationGuidanceVc?.id;

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
    const room = messagesData?.lookup.conversation?.room!;

    if (room.messages.length) {
      return [
        introMessage,
        ...room.messages?.map(message => ({
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

  const isSubscribedToMessages = useSubscribeOnRoomEvents(conversationId, !conversationId);

  const [askVcQuestion] = useAskVirtualContributorQuestionMutation();
  const askQuestion = async (
    question: string,
    refetchQueries?: AskVirtualContributorQuestionMutationOptions['refetchQueries']
  ) =>
    askVcQuestion({
      variables: {
        input: {
          conversationID: conversationId!,
          question,
          language: i18n.language.toUpperCase(),
        },
      },
      refetchQueries,
      awaitRefetchQueries: true,
    });

  const handleSendMessage = async (message: string): Promise<void> => {
    await askQuestion(message, ['GuidanceRoomMessages']);
  };

  const [clearChat, loadingClearChat] = useLoadingState(async () => {
    await resetCConversationVc();
  });

  return {
    loading: conversationIdLoading || messagesLoading || loadingClearChat,
    messages,
    isSubscribedToMessages,
    clearChat,
    sendMessage: handleSendMessage,
  };
};

export default useChatGuidanceCommunication;
