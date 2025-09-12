import { NotificationEventInAppState, NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useInAppNotificationsUnreadCountQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { ApolloCache } from '@apollo/client';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { mapInAppNotificationToModel } from './util/mapInAppNotificationToModel';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';

export const IN_APP_NOTIFICATIONS_PAGE_SIZE = 10;

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
export const NOTIFICATION_EVENT_TYPES: NotificationEvent[] = [];

export const useInAppNotifications = () => {
  const { isEnabled, isOpen } = useInAppNotificationsContext();
  const prevIsOpenRef = useRef(isOpen);

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();

  const { data, loading, error, fetchMore, refetch } = useInAppNotificationsQuery({
    variables: {
      types: NOTIFICATION_EVENT_TYPES,
      first: IN_APP_NOTIFICATIONS_PAGE_SIZE,
    },
    skip: !isEnabled || !isOpen,
  });

  // Refetch notifications only when the dialog is opened (false -> true transition)
  useEffect(() => {
    if (isEnabled && isOpen && !prevIsOpenRef.current && refetch) {
      refetch();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, isEnabled, refetch]);

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
      await markAsRead({
        variables: {
          notificationIds: [], // empty array means all unread
        },
        update: (_, result) => {
          if (result?.data?.markNotificationsAsRead) {
            // far simpler than updating the cache manually
            refetch?.();
          }
        },
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, [markAsRead]);

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
