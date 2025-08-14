import { useMemo } from 'react';
import {
  RoleSetContributorType,
  NotificationEventCategory,
  NotificationEventInAppState,
  SpaceLevel,
  InAppNotificationsQuery,
  NotificationEvent,
} from '@/core/apollo/generated/graphql-schema';
import {
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
  useMarkNotificationsAsReadMutation,
  InAppNotificationsDocument,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { ApolloCache } from '@apollo/client';

export interface InAppNotificationProps {
  id: string;
  type: NotificationEvent;
  triggeredAt: Date;
  state: NotificationEventInAppState;
  category: NotificationEventCategory;
  triggeredBy?: {
    profile:
      | {
          displayName: string;
          url: string;
          visual?: {
            uri: string;
          };
        }
      | undefined;
  };
  contributor?: {
    type?: RoleSetContributorType;
    profile:
      | {
          displayName: string;
          url: string;
          visual?: {
            uri: string;
          };
        }
      | undefined;
  };
  callout?: {
    framing:
      | {
          profile?:
            | {
                displayName: string;
                url: string;
              }
            | undefined;
        }
      | undefined;
  };
  space?: {
    id?: string;
    level: SpaceLevel;
    about: {
      profile:
        | {
            displayName: string;
            url: string;
            visual?: {
              uri: string;
            };
          }
        | undefined;
    };
  };
  comment?: string;
  commentUrl?: string;
  commentOriginName?: string;
}

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

  const items: InAppNotificationProps[] = useMemo(
    () => (data?.notificationsInApp ?? []).filter(item => item.state !== NotificationEventInAppState.Archived),
    [data]
  );

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
    const ids = items.filter(item => item.state === NotificationEventInAppState.Unread).map(item => item.id);

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

  return { items, isLoading: loading, updateNotificationState, markNotificationsAsRead };
};
