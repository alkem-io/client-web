import { useMemo } from 'react';
import {
  CalloutType,
  RoleSetContributorType,
  InAppNotificationCategory,
  InAppNotificationState,
  NotificationEventType,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import {
  refetchInAppNotificationsQuery,
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useInAppNotificationsContext } from './InAppNotificationsContext';

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

  const { data, loading } = useInAppNotificationsQuery({
    skip: !isEnabled,
  });

  const items: InAppNotificationProps[] = useMemo(
    () =>
      (data?.notifications ?? [])
        .filter(item => item.state !== InAppNotificationState.Archived)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()),
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
