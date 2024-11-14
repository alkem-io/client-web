import { useMemo } from 'react';
import {
  useAskChatGuidanceQuestionMutation,
  useGuidanceRoomIdQuery,
  useGuidanceRoomMessagesQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import useSubscribeOnRoomEvents from '../../../domain/collaboration/callout/useSubscribeOnRoomEvents';
import usePostMessageMutations from '../../../domain/communication/room/Comments/usePostMessageMutations';
import { Message } from '../../../domain/communication/room/models/Message';
import { buildAuthorFromUser } from '../../../domain/community/user/utils/buildAuthorFromUser';
import { useTranslation } from 'react-i18next';

interface Provided {
  roomId: string | undefined; //!! Probably not needed
  loading?: boolean;
  messages?: Message[];
  sendMessage: (message: string) => Promise<unknown>;
  isSubscribedToMessages: boolean;
}

const useChatGuidanceCommunication = ({ skip }: { skip?: boolean }): Provided => {
  const { i18n } = useTranslation();
  const [askQuestion] = useAskChatGuidanceQuestionMutation();

  const { data: roomIdData, loading: roomIdLoading } = useGuidanceRoomIdQuery({
    skip,
  });
  const roomId = roomIdData?.me.guidanceRoomID;

  const { data: messagesData, loading: messagesLoading } = useGuidanceRoomMessagesQuery({
    variables: {
      roomId: roomId!,
    },
    skip: !roomId || skip,
  });

  const messages = useMemo(
    () =>
      messagesData?.lookup.room?.messages?.map(message => ({
        id: message.id,
        threadID: message.threadID,
        message: message.message,
        author: message?.sender?.id ? buildAuthorFromUser(message.sender) : undefined,
        createdAt: new Date(message.timestamp),
        reactions: message.reactions,
      })),
    [messagesData]
  );

  const isSubscribedToMessages = useSubscribeOnRoomEvents(roomId, skip);

  const { postMessage } = usePostMessageMutations({ roomId, isSubscribedToMessages });

  const handleSendMessage = async (message: string): Promise<unknown> => {
    const { data } = await askQuestion({
      variables: {
        chatData: { question: message!, language: i18n.language.toUpperCase() },
      },
      fetchPolicy: 'network-only',
    });
    // postMessage to the room
    await postMessage(message);

    return data?.askChatGuidanceQuestion; //!! remove this
  };
  return {
    roomId,
    loading: roomIdLoading || messagesLoading,
    messages,
    isSubscribedToMessages,
    sendMessage: handleSendMessage,
  };
};

export default useChatGuidanceCommunication;
