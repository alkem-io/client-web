import { NotificationEventInAppState, NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useInAppNotificationIdsLazyQuery,
  useInAppNotificationsUnreadCountQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { ApolloCache } from '@apollo/client';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { mapInAppNotificationToModel } from './util/mapInAppNotificationToModel';
import { useMemo, useCallback } from 'react';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';

const IN_APP_NOTIFICATIONS_PAGE_SIZE = 10;

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

// The set of notification event types currently being retrieved
const NOTIFICATION_EVENT_TYPES: NotificationEvent[] = [];

export const useInAppNotifications = () => {
  const { isEnabled } = useInAppNotificationsContext();

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();
  const [getNotificationIds] = useInAppNotificationIdsLazyQuery();

  const { data, loading, error, fetchMore } = useInAppNotificationsQuery({
    variables: {
      types: NOTIFICATION_EVENT_TYPES,
      first: IN_APP_NOTIFICATIONS_PAGE_SIZE,
    },
    skip: !isEnabled,
  });

  const { data: unreadCountData } = useInAppNotificationsUnreadCountQuery({
    variables: {
      types: NOTIFICATION_EVENT_TYPES,
    },
    skip: !isEnabled,
  });

  // Memoize the filtered and mapped notifications to avoid unnecessary re-processing
  const notificationsInApp = useMemo(() => {
    const notifications: InAppNotificationModel[] = [];

    for (const notificationData of data?.me?.notifications?.inAppNotifications ?? []) {
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
  }, [data?.me?.notifications?.inAppNotifications]);

  // Calculate total unread count from the dedicated query
  const unreadCount = useMemo(() => {
    return unreadCountData?.me?.notificationsUnreadCount ?? 0;
  }, [unreadCountData?.me?.notificationsUnreadCount]);

  // Check if there are more notifications to load
  const hasMore = useMemo(() => {
    return data?.me?.notifications?.pageInfo?.hasNextPage ?? false;
  }, [data?.me?.notifications?.pageInfo?.hasNextPage]);

  // Function to fetch more notifications
  const fetchMoreNotifications = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          types: NOTIFICATION_EVENT_TYPES,
          first: IN_APP_NOTIFICATIONS_PAGE_SIZE,
          after: data?.me?.notifications?.pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            me: {
              ...prev.me,
              notifications: {
                ...fetchMoreResult.me.notifications,
                inAppNotifications: [
                  ...(prev.me?.notifications?.inAppNotifications ?? []),
                  ...(fetchMoreResult.me?.notifications?.inAppNotifications ?? []),
                ],
              },
            },
          };
        },
      });
    } catch (error) {
      console.error('Failed to fetch more notifications:', error);
    }
  }, [fetchMore, hasMore, loading, data?.me?.notifications?.pageInfo?.endCursor]);

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
    try {
      // First, get all notification IDs to find unread ones
      const { data: idsData } = await getNotificationIds({
        variables: {
          types: NOTIFICATION_EVENT_TYPES,
        },
      });

      const unreadIds =
        idsData?.me?.notifications?.inAppNotifications
          ?.filter(notification => notification.state === NotificationEventInAppState.Unread)
          ?.map(notification => notification.id) ?? [];

      if (unreadIds.length === 0) {
        return;
      }

      await markAsRead({
        variables: {
          notificationIds: unreadIds,
        },
        update: (cache, result) => {
          if (result?.data?.markNotificationsAsRead) {
            // Update individual notification objects in the cache
            updateNotificationsCache(cache, unreadIds, NotificationEventInAppState.Read);

            // Also refetch the main query to ensure UI consistency
            cache.evict({ fieldName: 'notifications' });
            cache.gc();
          }
        },
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, [markAsRead, getNotificationIds]);

  return {
    notificationsInApp,
    unreadCount,
    isLoading: loading,
    updateNotificationState,
    markNotificationsAsRead,
    fetchMore: fetchMoreNotifications,
    hasMore,
    error,
  };
};
