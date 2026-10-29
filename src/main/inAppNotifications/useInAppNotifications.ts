import type { ApolloCache } from '@apollo/client';
import { useEffect, useRef } from 'react';
import {
  useInAppNotificationsQuery,
  useInAppNotificationsUnreadCountQuery,
  useMarkNotificationsAsReadMutation,
  useUpdateNotificationStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type InAppNotificationsQuery,
  type NotificationEvent,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import type { InAppNotificationModel } from './model/InAppNotificationModel';
import {
  getCategoryFilterForNotificationType,
  getNotificationTypesForFilter,
  NotificationFilterType,
} from './notificationFilters';
import { mapInAppNotificationToModel } from './util/mapInAppNotificationToModel';

export const IN_APP_NOTIFICATIONS_PAGE_SIZE = 10;
// Pulled separately to drive the per-tab unread indicator. Large enough to
// reflect recent unread across categories without paginating.
const ALL_TYPES_PROBE_SIZE = 50;

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

type FetchedInAppNotification = NonNullable<
  InAppNotificationsQuery['me']['notifications']['inAppNotifications']
>[number];

// A notification the panel cannot render (its triggering actor no longer
// resolves) still counts towards the server's unread total, so it keeps the
// bell dot lit with nothing the user can click. Once no renderable unread
// notification is left among everything fetched, the unread unrenderable ones
// are returned so they can be marked read on the user's behalf. While any
// renderable unread notification remains, nothing is returned.
// `settledIds` are notifications whose state has just changed away from unread
// but whose new state may not be reflected in the fetched rows yet.
export const findHiddenUnreadToMarkRead = (
  fetched: ReadonlyArray<ReadonlyArray<FetchedInAppNotification> | undefined>,
  settledIds: ReadonlySet<string> = new Set()
): string[] => {
  const hiddenUnreadIds = new Set<string>();
  for (const rows of fetched) {
    for (const row of rows ?? []) {
      if (row.state !== NotificationEventInAppState.Unread || settledIds.has(row.id)) {
        continue;
      }
      if (mapInAppNotificationToModel(row)) {
        return [];
      }
      hiddenUnreadIds.add(row.id);
    }
  }
  return [...hiddenUnreadIds];
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

  // Probe all categories so we can render per-tab unread indicators independently
  // of the currently-selected filter's paginated list.
  const { data: allTypesData, refetch: refetchAllTypes } = useInAppNotificationsQuery({
    variables: {
      types: getNotificationTypesForFilter(NotificationFilterType.All),
      first: ALL_TYPES_PROBE_SIZE,
    },
    errorPolicy: 'ignore',
    skip: !isEnabled || !isOpen,
  });

  const unreadCountsByFilter: Record<NotificationFilterType, number> = {
    [NotificationFilterType.All]: 0,
    [NotificationFilterType.MessagesAndReplies]: 0,
    [NotificationFilterType.Space]: 0,
    [NotificationFilterType.Platform]: 0,
  };
  for (const notification of allTypesData?.me?.notifications?.inAppNotifications ?? []) {
    if (notification.state !== NotificationEventInAppState.Unread) continue;
    unreadCountsByFilter[NotificationFilterType.All] += 1;
    const categoryFilter = getCategoryFilterForNotificationType(notification.type);
    if (categoryFilter) {
      unreadCountsByFilter[categoryFilter] += 1;
    }
  }

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

  // Marks the given unrenderable notifications read. This is a follow-up to an
  // action that already succeeded, so a failure must not surface a second
  // error to the user: it skips the global error toast and is only logged. The
  // next read action retries, since the rows are still unread.
  const markHiddenNotificationsRead = async (ids: string[]) => {
    const results = await Promise.allSettled(
      ids.map(id =>
        updateState({
          variables: { ID: id, state: NotificationEventInAppState.Read },
          context: { skipGlobalErrorHandler: true },
          update: (cache, result) => {
            if (result?.data?.updateNotificationState === NotificationEventInAppState.Read) {
              updateNotificationsCache(cache, [id], NotificationEventInAppState.Read);
            }
          },
        })
      )
    );
    const failedIds = ids.filter((_, index) => results[index].status === 'rejected');
    if (failedIds.length > 0) {
      logError('Failed to mark hidden InAppNotifications as read', {
        category: TagCategoryValues.NOTIFICATIONS,
        label: `ids=${failedIds.join(',')}`,
      });
    }
  };

  const updateNotificationState = async (id: string, status: NotificationEventInAppState) => {
    try {
      const result = await updateState({
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
      if (status === NotificationEventInAppState.Unread || result?.data?.updateNotificationState !== status) {
        return;
      }
      const hiddenIds = findHiddenUnreadToMarkRead(
        [allTypesData?.me?.notifications?.inAppNotifications, data?.me?.notifications?.inAppNotifications],
        new Set([id])
      );
      if (hiddenIds.length > 0) {
        await markHiddenNotificationsRead(hiddenIds);
      }
    } catch (_error) {}
  };

  const markNotificationsAsRead = async () => {
    try {
      const result = await markAsRead({
        variables: {
          types: notificationTypes as NotificationEvent[],
        },
      });
      if (!result?.data?.markNotificationsAsRead) {
        return;
      }
      // far simpler than updating the cache manually; awaited so the check
      // below sees the post-mark state rather than the rows from before it
      const [tabResult, allTypesResult] = await Promise.all([refetch(), refetchAllTypes()]);
      const tabRows = tabResult?.data?.me?.notifications?.inAppNotifications;
      const allTypesRows = allTypesResult?.data?.me?.notifications?.inAppNotifications;
      if (!tabRows || !allTypesRows) {
        return;
      }
      const hiddenIds = findHiddenUnreadToMarkRead([allTypesRows, tabRows]);
      if (hiddenIds.length > 0) {
        await markHiddenNotificationsRead(hiddenIds);
      }
    } catch (_error) {}
  };

  return {
    notificationsInApp,
    unreadCount,
    unreadCountsByFilter,
    isLoading: loading,
    updateNotificationState,
    markNotificationsAsRead,
    fetchMore: fetchMoreNotifications,
    hasMore,
    error,
  };
};
