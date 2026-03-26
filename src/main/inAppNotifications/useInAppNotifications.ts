import type { ApolloCache } from '@apollo/client';
import { useEffect, useRef } from 'react';
import {
  useInAppNotificationsQuery,
  useInAppNotificationsUnreadCountQuery,
  useMarkNotificationsAsReadMutation,
  useUpdateNotificationStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { type NotificationEvent, NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import type { InAppNotificationModel } from './model/InAppNotificationModel';
import { getNotificationTypesForFilter } from './notificationFilters';
import { mapInAppNotificationToModel } from './util/mapInAppNotificationToModel';

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
  const { isEnabled, isOpen, selectedFilter } = useInAppNotificationsContext();
  const prevIsOpenRef = useRef(isOpen);
  const prevFilterRef = useRef(selectedFilter);

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();

  // Get the notification types based on the selected filter
  const notificationTypes = getNotificationTypesForFilter(selectedFilter);

  const { data, loading, error, fetchMore, refetch } = useInAppNotificationsQuery({
    variables: {
      types: notificationTypes,
      first: IN_APP_NOTIFICATIONS_PAGE_SIZE,
    },
    errorPolicy: 'ignore',
    skip: !isEnabled || !isOpen,
  });

  // Refetch notifications when the dialog is opened OR when the filter changes
  useEffect(() => {
    const filterChanged = prevFilterRef.current !== selectedFilter;
    const dialogOpened = isEnabled && isOpen && !prevIsOpenRef.current;

    if ((dialogOpened || filterChanged) && refetch) {
      refetch();
    }

    prevIsOpenRef.current = isOpen;
    prevFilterRef.current = selectedFilter;
  }, [isOpen, isEnabled, selectedFilter, refetch]);

  const { data: unreadCountData } = useInAppNotificationsUnreadCountQuery({
    skip: !isEnabled,
  });

  // Memoize the filtered and mapped notifications to avoid unnecessary re-processing
  const notificationsInApp = (() => {
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
  })();

  // Calculate total unread count from the dedicated query
  const unreadCount = (() => {
    return unreadCountData?.me?.notificationsUnreadCount ?? 0;
  })();

  // Check if there are more notifications to load
  const hasMore = (() => {
    return data?.me?.notifications?.pageInfo?.hasNextPage ?? false;
  })();

  // Function to fetch more notifications
  const fetchMoreNotifications = async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          types: notificationTypes,
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
    } catch (_error) {}
  };

  const updateNotificationState = async (id: string, status: NotificationEventInAppState) => {
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
    } catch (_error) {}
  };

  const markNotificationsAsRead = async () => {
    try {
      await markAsRead({
        variables: {
          types: notificationTypes as NotificationEvent[],
        },
        update: (_, result) => {
          if (result?.data?.markNotificationsAsRead) {
            // far simpler than updating the cache manually
            refetch?.();
          }
        },
      });
    } catch (_error) {}
  };

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
