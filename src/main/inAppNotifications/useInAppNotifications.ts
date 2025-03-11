import produce from 'immer';
import { useMemo } from 'react';
import {
  CalloutType,
  RoleSetContributorType,
  InAppNotificationCategory,
  InAppNotificationState,
  NotificationEventType,
  SpaceLevel,
  InAppNotificationReceivedSubscription,
  InAppNotificationsQuery,
  InAppNotificationReceivedSubscriptionVariables,
} from '@/core/apollo/generated/graphql-schema';
import {
  InAppNotificationReceivedDocument,
  refetchInAppNotificationsQuery,
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import useSubscribeToMore from '@/core/apollo/subscriptions/useSubscribeToMore';

export interface InAppNotificationProps {
  id: string;
  type: NotificationEventType;
  triggeredAt: Date;
  state: InAppNotificationState;
  category: InAppNotificationCategory;
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
    type: RoleSetContributorType;
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
  actor?: {
    __typename: string;
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
    type: CalloutType;
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

export const useInAppNotifications = () => {
  const { isEnabled } = useInAppNotificationsContext();

  const [updateState] = useUpdateNotificationStateMutation();

  const { data, loading, subscribeToMore } = useInAppNotificationsQuery({
    skip: !isEnabled,
  });

  useSubscribeToMore<
    InAppNotificationsQuery,
    InAppNotificationReceivedSubscription,
    InAppNotificationReceivedSubscriptionVariables
  >(subscribeToMore, {
    skip: !isEnabled,
    document: InAppNotificationReceivedDocument,
    updateQuery: (prev, { subscriptionData }) => {
      if (!prev.notifications || !subscriptionData.data?.inAppNotificationReceived) {
        return prev;
      }

      return produce(prev, draft => {
        draft.notifications = [subscriptionData.data.inAppNotificationReceived, ...draft.notifications];
      });
    },
  });

  const items: InAppNotificationProps[] = useMemo(
    () => (data?.notifications ?? []).filter(item => item.state !== InAppNotificationState.Archived),
    [data]
  );

  const updateNotificationState = async (id: string, status: InAppNotificationState) => {
    await updateState({
      variables: {
        ID: id,
        state: status,
      },
      refetchQueries: [refetchInAppNotificationsQuery()],
    });
  };

  return { items, isLoading: loading, updateNotificationState };
};
