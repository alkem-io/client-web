import ensurePresence from '@core/utils/ensurePresence';
import {
  MessageDetailsFragmentDoc,
  useReplyToMessageMutation,
  useSendMessageToRoomMutation,
} from '@core/apollo/generated/apollo-hooks';

interface UsePostMessageMutationsOptions {
  roomId: string | undefined;
  isSubscribedToMessages: boolean;
}

const usePostMessageMutations = ({ roomId, isSubscribedToMessages }: UsePostMessageMutationsOptions) => {
  const [postMessage, { loading: postingMessage }] = useSendMessageToRoomMutation({
    update: (cache, { data }) => {
      if (isSubscribedToMessages) {
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
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendMessageToRoom,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

  const [postReply, { loading: postingReply }] = useReplyToMessageMutation({
    update: (cache, { data }) => {
      if (isSubscribedToMessages) {
        return;
      }

      const cacheCommentsId = cache.identify({
        id: roomId,
        __typename: 'Room',
      });

      if (!cacheCommentsId) {
        return;
      }

      cache.modify({
        id: cacheCommentsId,
        fields: {
          messages(existingMessages = []) {
            if (!data) {
              return existingMessages;
            }

            const newMessage = cache.writeFragment({
              data: data?.sendMessageReplyToRoom,
              fragment: MessageDetailsFragmentDoc,
              fragmentName: 'MessageDetails',
            });
            return [...existingMessages, newMessage];
          },
        },
      });
    },
  });

  const handlePostMessage = (message: string) => {
    const requiredRoomId = ensurePresence(roomId);

    return postMessage({
      variables: {
        messageData: {
          roomID: requiredRoomId,
          message,
        },
      },
    });
  };

  const handleReply = ({ threadId, messageText }: { threadId: string; messageText: string }) => {
    const requiredRoomId = ensurePresence(roomId);

    return postReply({
      variables: {
        roomId: requiredRoomId,
        message: messageText,
        threadId,
      },
    });
  };

  return {
    postMessage: handlePostMessage,
    postReply: handleReply,
    postingMessage,
    postingReply,
  };
};

export default usePostMessageMutations;
