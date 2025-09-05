import { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
  useInAppNotificationsUnreadCountQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { ApolloCache } from '@apollo/client';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { mapInAppNotificationToModel } from './util/mapInAppNotificationToModel';
import { useMemo, useCallback } from 'react';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';

// Update the cache as refetching all could be expensive
const updateNotificationsCache = (
  cache: ApolloCache<unknown>,
  ids: string[],
  newState: NotificationEventInAppState
) => {
  // Modify individual notification objects in the cache
  ids.forEach(id => {
    cache.modify({
      id: cache.identify({ __typename: 'InAppNotification', id }),
      fields: {
        state: () => newState,
      },
    });
  });
};

export const useInAppNotifications = () => {
  const { isEnabled } = useInAppNotificationsContext();

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();

  const { data, loading } = useInAppNotificationsQuery({
    skip: !isEnabled,
  });

  const { data: unreadCountData } = useInAppNotificationsUnreadCountQuery({
    skip: !isEnabled,
  });

  // Memoize the filtered and mapped notifications to avoid unnecessary re-processing
  const notificationsInApp = useMemo(() => {
    const notifications: InAppNotificationModel[] = [];

    for (const notificationData of data?.me.notifications ?? []) {
      if (notificationData.state === NotificationEventInAppState.Archived) {
        continue; // Skip archived notifications
      }

      const notification = mapInAppNotificationToModel(notificationData);
      if (notification) {
        notifications.push(notification);
      } else {
        logError('Broken InAppNotification', {
          category: TagCategoryValues.NOTIFICATIONS,
          label: `id=${notificationData?.id}, type=${notificationData?.type}`,
        });
      }
    }

    return notifications;
  }, [data?.me.notifications]);

  const updateNotificationState = useCallback(
    async (id: string, status: NotificationEventInAppState) => {
      try {
        await updateState({
          variables: {
            ID: id,
            state: status,
          },
          update: (cache, result) => {
            if (result?.data?.updateNotificationState === status) {
              updateNotificationsCache(cache, [id], status);
            }
          },
        });
      } catch (error) {
        console.error('Failed to update notification state:', error);
      }
    },
    [updateState]
  );

  const markNotificationsAsRead = useCallback(async () => {
    const unreadIds = notificationsInApp
      .filter(item => item.state === NotificationEventInAppState.Unread)
      .map(item => item.id);

    if (unreadIds.length === 0) {
      return;
    }

    try {
      await markAsRead({
        variables: {
          notificationIds: unreadIds,
        },
        update: (cache, result) => {
          if (result?.data?.markNotificationsAsRead) {
            updateNotificationsCache(cache, unreadIds, NotificationEventInAppState.Read);
          }
        },
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, [markAsRead, notificationsInApp]);

  return {
    notificationsInApp,
    unreadNotificationsCount: unreadCountData?.me?.notificationsUnreadCount ?? 0,
    isLoading: loading,
    updateNotificationState,
    markNotificationsAsRead,
  };
};
