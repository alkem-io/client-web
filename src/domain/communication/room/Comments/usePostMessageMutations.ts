import ensurePresence from '@/core/utils/ensurePresence';
import {
  MessageDetailsFragmentDoc,
  useRemoveMessageOnRoomMutation,
  useReplyToMessageMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';

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

  const [deleteMessage, { loading: deletingMessage }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const handleDeleteMessage = (commentsId: string, messageId: string) =>
    deleteMessage({
      variables: {
        messageData: {
          roomID: commentsId,
          messageID: messageId,
        },
      },
    });

  return {
    postMessage: handlePostMessage,
    postReply: handleReply,
    deleteMessage: handleDeleteMessage,
    postingMessage,
    postingReply,
    deletingMessage,
  };
};

export default usePostMessageMutations;
