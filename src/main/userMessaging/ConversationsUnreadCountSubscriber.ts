import {
  useOnConversationsUnreadCountSubscription,
  ConversationsUnreadCountDocument,
} from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';

export const ConversationsUnreadCountSubscriber = () => {
  const { isEnabled } = useUserMessagingContext();
  const handleError = useApolloErrorHandler();

  useOnConversationsUnreadCountSubscription({
    skip: !isEnabled,
    onData: ({ client, data: subscriptionData }) => {
      const { data, error } = subscriptionData;

      if (error) {
        return handleError(error);
      }

      if (!data) {
        return;
      }

      const { conversationsUnreadCount } = data;

      // Update the unread count query cache
      client.cache.updateQuery(
        {
          query: ConversationsUnreadCountDocument,
        },
        existingData => {
          if (!existingData?.me) {
            return existingData;
          }

          return {
            ...existingData,
            me: {
              ...existingData.me,
              conversationsUnreadCount,
            },
          };
        }
      );
    },
  });

  return null;
};
