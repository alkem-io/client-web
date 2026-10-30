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

// Shared by every mounted instance of the hook, so each hidden notification is sent once
const hiddenIdsMarkedRead = new Set<string>();

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
    // Report refetches and fetchMore as loading too, so a refresh can wait for them
    notifyOnNetworkStatusChange: true,
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
  const {
    data: allTypesData,
    loading: allTypesLoading,
    refetch: refetchAllTypes,
  } = useInAppNotificationsQuery({
    variables: {
      types: getNotificationTypesForFilter(NotificationFilterType.All),
      first: ALL_TYPES_PROBE_SIZE,
    },
    errorPolicy: 'ignore',
    notifyOnNetworkStatusChange: true,
    skip: !isEnabled || !isOpen,
  });

  // Re-read the newest rows, as many as are loaded; a refetch would drop the pages loaded by fetchMore.
  const loadNewNotifications = () => {
    const requestFilter = selectedFilter;
    const loadedCount = data?.me?.notifications?.inAppNotifications?.length ?? 0;
    fetchMore({
      variables: {
        types: notificationTypes,
        first: Math.max(loadedCount, IN_APP_NOTIFICATIONS_PAGE_SIZE),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        // Apollo merges into the query's current variables; drop a response for a filter the user has left
        if (prevFilterRef.current !== requestFilter) return prev;
        const loaded = prev?.me?.notifications?.inAppNotifications ?? [];
        const newest = fetchMoreResult.me?.notifications?.inAppNotifications ?? [];
        const newestIds = new Set(newest.map(({ id }) => id));
        // Without a loaded row among the newest ones, more arrived than were fetched: keeping the
        // loaded rows would leave a gap, so show the newest rows and continue paging after them.
        if (!loaded.some(({ id }) => newestIds.has(id))) return fetchMoreResult;

        return {
          ...fetchMoreResult,
          me: {
            ...fetchMoreResult.me,
            notifications: {
              ...fetchMoreResult.me.notifications,
              // The loaded rows continue the newest ones, so the next page still follows the last loaded row
              pageInfo: prev?.me?.notifications?.pageInfo ?? fetchMoreResult.me.notifications.pageInfo,
              inAppNotifications: [...newest, ...loaded.filter(({ id }) => !newestIds.has(id))],
            },
          },
        };
      },
    }).catch(() => {});
  };

  // The count subscription only updates the count cache; pull the new notification
  // into the open dialog (list and per-tab probe) when the count rises. A first count
  // arriving while the dialog is open counts too: before it the subscription has no
  // cached count to update, so a notification in that window shows only through it.
  // Apollo shares an identical request already in flight, and a response that started
  // before the arrival does not hold it, so the refresh waits until neither query is loading.
  const fetchedUnreadCount = unreadCountData?.me?.notificationsUnreadCount;
  const prevUnreadCountRef = useRef(fetchedUnreadCount);
  const refreshPendingRef = useRef(false);
  useEffect(() => {
    const previous = prevUnreadCountRef.current;
    prevUnreadCountRef.current = fetchedUnreadCount;
    if (!isEnabled || !isOpen) {
      refreshPendingRef.current = false;
      return;
    }
    if (fetchedUnreadCount !== undefined && (previous === undefined || fetchedUnreadCount > previous)) {
      refreshPendingRef.current = true;
    }
    if (refreshPendingRef.current && !loading && !allTypesLoading) {
      refreshPendingRef.current = false;
      loadNewNotifications();
      refetchAllTypes().catch(() => {});
    }
  }, [fetchedUnreadCount, isEnabled, isOpen, loading, allTypesLoading, loadNewNotifications, refetchAllTypes]);

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

  // Unread notifications the panel cannot render still keep the bell dot on.
  // Once no visible unread notification is left, mark those read too.
  useEffect(() => {
    if (!allTypesData || !data) return;
    const unread = [
      ...(allTypesData.me?.notifications?.inAppNotifications ?? []),
      ...(data.me?.notifications?.inAppNotifications ?? []),
    ].filter(notification => notification.state === NotificationEventInAppState.Unread);
    if (unread.some(notification => mapInAppNotificationToModel(notification))) return;
    for (const { id } of unread) {
      if (hiddenIdsMarkedRead.has(id)) continue;
      hiddenIdsMarkedRead.add(id);
      updateState({
        variables: { ID: id, state: NotificationEventInAppState.Read },
        context: { skipGlobalErrorHandler: true },
        update: (cache, result) => {
          if (result?.data?.updateNotificationState === NotificationEventInAppState.Read) {
            updateNotificationsCache(cache, [id], NotificationEventInAppState.Read);
          }
        },
      }).catch(() => {});
    }
  }, [allTypesData, data, updateState]);

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
            refetchAllTypes?.();
          }
        },
      });
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
