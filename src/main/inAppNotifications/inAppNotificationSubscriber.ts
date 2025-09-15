import {
  useInAppNotificationReceivedSubscription,
  InAppNotificationsDocument,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { IN_APP_NOTIFICATIONS_PAGE_SIZE, NOTIFICATION_EVENT_TYPES } from './useInAppNotifications';

export const InAppNotificationSubscriber = () => {
  const { isEnabled } = useInAppNotificationsContext();
  const handleError = useApolloErrorHandler();

  useInAppNotificationReceivedSubscription({
    skip: !isEnabled,
    onData: ({ client, data: subscriptionData }) => {
      const { data, error } = subscriptionData;

      if (error) {
        return handleError(error);
      }

      if (!data) {
        return;
      }

      const { inAppNotificationReceived: newNotification } = data;

      // Update the notifications query cache
      client.cache.updateQuery(
        {
          query: InAppNotificationsDocument,
          variables: {
            types: NOTIFICATION_EVENT_TYPES,
            first: IN_APP_NOTIFICATIONS_PAGE_SIZE,
          },
        },
        existingData => {
          if (!existingData?.me?.notifications) {
            return existingData;
          }

          return {
            ...existingData,
            me: {
              ...existingData.me,
              notifications: {
                ...existingData.me.notifications,
                inAppNotifications: [newNotification, ...(existingData.me.notifications.inAppNotifications || [])],
              },
            },
          };
        }
      );
    },
  });

  return null;
};
