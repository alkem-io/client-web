import { useInAppNotificationsUnreadCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';

/**
 * Reads the current count of unread in-app (non-chat) notifications — the same
 * number the notification bell shows. The global InAppNotificationCountSubscriber
 * already keeps this query's cache fresh on every count change, so this adds no
 * new subscription. Used by the browser-tab badge (US5).
 */
export const useUnreadNotificationsCount = (): number => {
  const { isEnabled } = useInAppNotificationsContext();

  const { data } = useInAppNotificationsUnreadCountQuery({
    skip: !isEnabled,
    fetchPolicy: 'cache-first',
  });

  return data?.me?.notificationsUnreadCount ?? 0;
};
