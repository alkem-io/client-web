import { useRef } from 'react';
import {
  InAppNotificationsUnreadCountDocument,
  useNotificationsUnreadCountSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import type { UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { playSound } from '@/core/sound/soundPlayer';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { NOTIFICATION_EVENT_TYPES } from '@/main/inAppNotifications/useInAppNotifications';
import { shouldPlayNotificationSound } from './shouldPlayNotificationSound';

export const InAppNotificationCountSubscriber = () => {
  const { isEnabled } = useInAppNotificationsContext();
  const handleError = useApolloErrorHandler();
  const { userModel } = useCurrentUserContext();

  // Read through refs: onData is memoized by the React Compiler, so values it
  // reads must not be captured by a stale closure.
  const previousCountRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(true);
  soundEnabledRef.current =
    (userModel as UserDetailsFragment | undefined)?.settings?.notification?.sound?.inAppNotification ?? true;

  // This component never unmounts, so the ref outlives a skipped subscription.
  // Clear it while disabled so the first count of the next enabled session is
  // treated as "first observed" (never sounds) instead of being compared against
  // a stale count from a previous session — which would either ding spuriously or,
  // if the stale count was higher, silence every genuinely new notification until
  // the count climbed back past it.
  if (!isEnabled) {
    previousCountRef.current = null;
  }

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

      // Play the notification sound on a strict increase only (US2). This adds
      // no new subscription — it reuses the already-global count subscriber.
      if (shouldPlayNotificationSound(previousCountRef.current, notificationsUnreadCount, soundEnabledRef.current)) {
        playSound('notification');
      }
      previousCountRef.current = notificationsUnreadCount;

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
