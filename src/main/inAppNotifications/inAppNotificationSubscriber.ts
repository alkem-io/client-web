import {
  InAppNotificationAllTypesFragmentDoc,
  useInAppNotificationReceivedSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';

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

      client.cache.modify({
        fields: {
          me(existingMe) {
            if (!existingMe) return existingMe;

            const newNotificationRef = client.cache.writeFragment({
              data: newNotification,
              fragment: InAppNotificationAllTypesFragmentDoc,
              fragmentName: 'InAppNotificationAllTypes',
            });

            // Update both the notifications list and the unread count
            return {
              ...existingMe,
              notifications: [newNotificationRef, ...(existingMe.notifications || [])],
            };
          },
        },
      });
    },
  });

  return null;
};
