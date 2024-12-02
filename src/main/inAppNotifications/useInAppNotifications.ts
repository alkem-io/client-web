import { useEffect, useMemo } from 'react';
import {
  CalloutType,
  CommunityContributorType,
  InAppNotificationState,
  PlatformRole,
  SpaceLevel,
} from '../../core/apollo/generated/graphql-schema';
import {
  refetchInAppNotificationsQuery,
  useInAppNotificationsQuery,
  useUpdateNotificationStateMutation,
} from '../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../domain/community/user';

const POLLING_INTERVAL = 5 * 1000; // 5 seconds

export enum InAppNotificationType {
  COLLABORATION_CALLOUT_PUBLISHED = 'collaborationCalloutPublished',
  COMMUNICATION_USER_MENTION = 'communicationUserMention',
  COMMUNITY_NEW_MEMBER = 'communityNewMember',
}

export enum InAppNotificationCategory {
  PERSONAL = 'self',
  ADMIN = 'admin',
}

export interface InAppNotificationProps {
  id: string;
  type: string; // InAppNotificationType;
  triggeredAt: Date;
  state: InAppNotificationState;
  category: string; // InAppNotificationCategory;
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
    type: CommunityContributorType;
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
  comment?: string;
}

export const useInAppNotifications = () => {
  const { user, platformRoles } = useUserContext();

  const [updateState] = useUpdateNotificationStateMutation();

  const enableNotifications = useMemo(() => {
    return user?.user.id && platformRoles?.includes(PlatformRole.BetaTester);
  }, [user, platformRoles]);

  const { data, loading, startPolling, stopPolling } = useInAppNotificationsQuery({
    variables: {
      receiverID: user?.user.id!,
    },
    skip: !enableNotifications,
  });

  useEffect(() => {
    if (startPolling) {
      startPolling(POLLING_INTERVAL);
    }

    return stopPolling;
  }, [data, startPolling, stopPolling]);

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
      refetchQueries: [refetchInAppNotificationsQuery({ receiverID: user?.user.id! })],
    });
  };

  return { items, isLoading: loading, updateNotificationState };
};
