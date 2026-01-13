import {
  MessageDetailsFragmentDoc,
  useOnUserConversationMessageSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import { MutationType } from '@/core/apollo/generated/graphql-schema';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';

interface UserConversationMessageSubscriberProps {
  skip?: boolean;
}

export const UserConversationMessageSubscriber = ({ skip = false }: UserConversationMessageSubscriberProps) => {
  const { isEnabled } = useUserMessagingContext();
  const handleError = useApolloErrorHandler();

  useOnUserConversationMessageSubscription({
    skip: !isEnabled || skip,
    onData: ({ client, data: subscriptionData }) => {
      const { data, error } = subscriptionData;

      if (error) {
        return handleError(error);
      }

      if (!data?.userConversationMessage) {
        return;
      }

      const { roomId, type, data: messageData } = data.userConversationMessage;

      const roomRefId = client.cache.identify({
        id: roomId,
        __typename: 'Room',
      });

      if (!roomRefId) {
        return;
      }

      const messageRefId = client.cache.identify({
        id: messageData.id,
        __typename: 'Message',
      });

      switch (type) {
        case MutationType.Create: {
          client.cache.modify({
            id: roomRefId,
            fields: {
              messages(existingMessages = []) {
                if (messageRefId && existingMessages.some((m: { __ref: string }) => m.__ref === messageRefId)) {
                  return existingMessages; // Message already in the list
                }
                // Write the message data to the cache
                const newMessageRef = client.cache.writeFragment({
                  data: {
                    __typename: 'Message',
                    id: messageData.id,
                    message: messageData.message,
                    timestamp: messageData.timestamp,
                    threadID: null,
                    reactions: [],
                    sender: messageData.sender,
                  },
                  fragment: MessageDetailsFragmentDoc,
                  fragmentName: 'MessageDetails',
                });
                return [...existingMessages, newMessageRef];
              },
              messagesCount(existingCount = 0) {
                return existingCount + 1;
              },
            },
          });
          break;
        }
        case MutationType.Delete: {
          client.cache.modify({
            id: roomRefId,
            fields: {
              messages(existingMessages = []) {
                return existingMessages.filter((message: { __ref: string }) => message.__ref !== messageRefId);
              },
              messagesCount(existingCount = 0) {
                return Math.max(0, existingCount - 1);
              },
            },
          });
          evictFromCache(client.cache, messageData.id, 'Message');
          break;
        }
      }
    },
  });

  return null;
};
