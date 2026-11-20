import type { Reference } from '@apollo/client';
import {
  MessageDetailsFragmentDoc,
  useRemoveMessageOnRoomMutation,
  useReplyToMessageMutation,
  useSendMessageToRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { RoomMessageAttachmentInput } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { refreshRoomMessagesCount } from './refreshRoomMessagesCount';

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

  const handlePostMessage = (message: string, attachmentUpload?: RoomMessageAttachmentInput) => {
    const requiredRoomId = ensurePresence(roomId, 'roomId');

    return postMessage({
      variables: {
        messageData: {
          roomID: requiredRoomId,
          message,
          attachmentUpload,
        },
      },
    });
  };

  const handleReply = ({
    threadId,
    messageText,
    attachmentUpload,
  }: {
    threadId: string;
    messageText: string;
    attachmentUpload?: RoomMessageAttachmentInput;
  }) => {
    const requiredRoomId = ensurePresence(roomId, 'roomId');

    return postReply({
      variables: {
        roomId: requiredRoomId,
        message: messageText,
        threadId,
        attachmentUpload,
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
