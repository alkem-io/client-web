import type { ApolloCache, Reference } from '@apollo/client';
import {
  MessageDetailsFragmentDoc,
  useRemoveMessageOnRoomMutation,
  useReplyToMessageMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import useEnsurePresence from '@/core/utils/ensurePresence';

// Refresh Room.messagesCount from the current Room.messages array length
// so the discussion-list count stays in sync after add/remove. Both the
// list query (DiscussionCard) and the detail query (DiscussionDetails)
// resolve `comments` to the same normalized Room object, so updating
// messagesCount here keeps the count consistent across every consumer.
function refreshRoomMessagesCount(cache: ApolloCache<unknown>, roomCacheId: string) {
  cache.modify({
    id: roomCacheId,
    fields: {
      messagesCount(_existing, { readField }) {
        const messages = readField<readonly Reference[]>('messages');
        return messages?.length ?? 0;
      },
    },
  });
}

interface UsePostMessageMutationsOptions {
  roomId: string | undefined;
  isSubscribedToMessages: boolean;
}

const usePostMessageMutations = ({ roomId, isSubscribedToMessages }: UsePostMessageMutationsOptions) => {
  const ensurePresence = useEnsurePresence();
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
      refreshRoomMessagesCount(cache, cacheRoomId);
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
      refreshRoomMessagesCount(cache, cacheCommentsId);
    },
  });

  const handlePostMessage = (message: string) => {
    const requiredRoomId = ensurePresence(roomId, 'roomId');

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
    const requiredRoomId = ensurePresence(roomId, 'roomId');

    return postReply({
      variables: {
        roomId: requiredRoomId,
        message: messageText,
        threadId,
      },
    });
  };

  const [deleteMessage, { loading: deletingMessage }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) => {
      if (!data?.removeMessageOnRoom) return;
      const messageId = String(data.removeMessageOnRoom);
      const messageRef = cache.identify({ id: messageId, __typename: 'Message' });
      const cacheRoomId = roomId ? cache.identify({ id: roomId, __typename: 'Room' }) : undefined;
      if (cacheRoomId && messageRef) {
        cache.modify({
          id: cacheRoomId,
          fields: {
            messages(existing: readonly Reference[] = []) {
              return existing.filter(ref => ref.__ref !== messageRef);
            },
          },
        });
        refreshRoomMessagesCount(cache, cacheRoomId);
      }
      evictFromCache(cache, messageId, 'Message');
    },
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
