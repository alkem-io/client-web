import {
  useNotificationsUnreadCountSubscription,
  InAppNotificationsUnreadCountDocument,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { NOTIFICATION_EVENT_TYPES } from '@/main/inAppNotifications/useInAppNotifications';

export const InAppNotificationCountSubscriber = () => {
  const { isEnabled } = useInAppNotificationsContext();
  const handleError = useApolloErrorHandler();

  useNotificationsUnreadCountSubscription({
    skip: !isEnabled,
    onData: ({ client, data: subscriptionData }) => {
      const { data, error } = subscriptionData;

      if (error) {
        return handleError(error);
      }

      if (!data) {
        return;
      }

      const { notificationsUnreadCount } = data;

      // Update the unread count query cache
      client.cache.updateQuery(
        {
          query: InAppNotificationsUnreadCountDocument,
          variables: {
            types: NOTIFICATION_EVENT_TYPES,
          },
        },
        existingData => {
          if (!existingData?.me) {
            return existingData;
          }

          return {
            ...existingData,
            me: {
              ...existingData.me,
              notificationsUnreadCount,
            },
          };
        }
      );
    },
  });

  return null;
};
