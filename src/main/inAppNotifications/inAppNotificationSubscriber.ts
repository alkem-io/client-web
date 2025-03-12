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
          notifications(existingNotifications = []) {
            const newNotificationRef = client.cache.writeFragment({
              data: newNotification,
              fragment: InAppNotificationAllTypesFragmentDoc,
              fragmentName: 'InAppNotificationAllTypes',
            });
            // unshift
            return [newNotificationRef, ...existingNotifications];
          },
        },
      });
    },
  });

  return null;
};
