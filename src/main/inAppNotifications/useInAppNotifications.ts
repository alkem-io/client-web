import { NotificationEventInAppState, NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useInAppNotificationIdsLazyQuery,
  useInAppNotificationUnreadCountQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
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

// The set of notification event types currently being retrieved
const NOTIFICATION_EVENT_TYPES: NotificationEvent[] = [
  NotificationEvent.UserMentioned,
  NotificationEvent.SpaceCollaborationCalloutPublished,
  NotificationEvent.SpaceAdminCommunityNewMember,
  NotificationEvent.UserSpaceCommunityJoined,
];

const PAGE_SIZE = 10;

export const useInAppNotifications = () => {
  const { isEnabled } = useInAppNotificationsContext();

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();
  const [getNotificationIds] = useInAppNotificationIdsLazyQuery();

  // Query for the main notifications list
  const { data, loading, error, fetchMore } = useInAppNotificationsQuery({
    variables: {
      first: PAGE_SIZE,
      types: NOTIFICATION_EVENT_TYPES,
    },
    skip: !isEnabled,
  });

  // Query for getting the total unread count
  const { data: countData } = useInAppNotificationUnreadCountQuery({
    variables: {
      types: NOTIFICATION_EVENT_TYPES,
    },
    skip: !isEnabled,
  });

  const hasMore = data?.notificationsInApp?.pageInfo?.hasNextPage;

  const fetchMoreNotifications = useCallback(async () => {
    if (!hasMore || loading) return;

    await fetchMore({
      variables: {
        first: PAGE_SIZE,
        after: data?.notificationsInApp?.pageInfo?.endCursor,
        types: NOTIFICATION_EVENT_TYPES,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          ...prev,
          notificationsInApp: {
            ...fetchMoreResult.notificationsInApp,
            inAppNotifications: [
              ...prev.notificationsInApp.inAppNotifications,
              ...fetchMoreResult.notificationsInApp.inAppNotifications,
            ],
          },
        };
      },
    });
  }, [fetchMore, hasMore, loading, data?.notificationsInApp?.pageInfo?.endCursor]);

  // Memoize the filtered and mapped notifications to avoid unnecessary re-processing
  const notificationsInApp = useMemo(() => {
    const notifications: InAppNotificationModel[] = [];

    for (const notificationData of data?.notificationsInApp?.inAppNotifications ?? []) {
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
  }, [data?.notificationsInApp?.inAppNotifications]);

  // Calculate total unread count from the dedicated query
  const unreadCount = useMemo(() => {
    return (
      countData?.notificationsInApp?.inAppNotifications?.filter(
        notification => notification.state === NotificationEventInAppState.Unread
      ).length ?? 0
    );
  }, [countData?.notificationsInApp?.inAppNotifications]);

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
        idsData?.notificationsInApp?.inAppNotifications
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
            cache.evict({ fieldName: 'notificationsInApp' });
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
