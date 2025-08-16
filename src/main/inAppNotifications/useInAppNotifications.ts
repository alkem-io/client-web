import { NotificationEventInAppState, InAppNotificationsQuery } from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
  InAppNotificationsDocument,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { ApolloCache } from '@apollo/client';
import { InAppNotificationModel } from './model/InAppNotificationModel';

// update the cache as refetching all could be expensive
const updateNotificationsCache = (
  cache: ApolloCache<InAppNotificationsQuery>,
  ids: string[],
  newState: NotificationEventInAppState
) => {
  const existingData = cache.readQuery<InAppNotificationsQuery>({
    query: InAppNotificationsDocument,
  });

  if (existingData) {
    const updatedNotifications = existingData.notificationsInApp.map(notification =>
      ids.includes(notification.id) ? { ...notification, state: newState } : notification
    );

    cache.writeQuery({
      query: InAppNotificationsDocument,
      data: { notifications: updatedNotifications },
    });
  }
};

export const useInAppNotifications = () => {
  const { isEnabled } = useInAppNotificationsContext();

  const [updateState] = useUpdateNotificationStateMutation();
  const [markAsRead] = useMarkNotificationsAsReadMutation();

  const { data, loading } = useInAppNotificationsQuery({
    skip: !isEnabled,
  });

  const notificationsInApp: InAppNotificationModel[] = [];
  for (const notificationData of data?.notificationsInApp ?? []) {
    if (notificationData.state !== NotificationEventInAppState.Archived) {
      const notification: InAppNotificationModel = {
        id: notificationData.id,
        type: notificationData.type,
        triggeredAt: notificationData.triggeredAt,
        state: notificationData.state,
        category: notificationData.category,
        triggeredBy: notificationData.triggeredBy,
        payload: notificationData.payload,
      };
      notificationsInApp.push(notification);
    }
  }

  const updateNotificationState = async (id: string, status: NotificationEventInAppState) => {
    await updateState({
      variables: {
        ID: id,
        state: status,
      },
      update: (cache, data) => {
        if (data?.data?.updateNotificationState === status) {
          updateNotificationsCache(cache, [id], status);
        }
      },
    });
  };

  const markNotificationsAsRead = async () => {
    const ids = notificationsInApp
      .filter(item => item.state === NotificationEventInAppState.Unread)
      .map(item => item.id);

    if (ids.length === 0) {
      return;
    }

    await markAsRead({
      variables: {
        notificationIds: ids,
      },
      update: (cache, data) => {
        if (data?.data?.markNotificationsAsRead) {
          updateNotificationsCache(cache, ids, NotificationEventInAppState.Read);
        }
      },
    });
  };

  return { notificationsInApp, isLoading: loading, updateNotificationState, markNotificationsAsRead };
};
