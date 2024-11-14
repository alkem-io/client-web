import { useEffect, useMemo } from 'react';
import { CommunityContributorType, SpaceLevel } from '../../core/apollo/generated/graphql-schema';
import { useInAppNotificationsQuery } from '../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../domain/community/user';

const POLLING_INTERVAL = 30 * 1000; // 30 seconds

export enum InAppNotificationType {
  COLLABORATION_CALLOUT_PUBLISHED = 'collaborationCalloutPublished',
  COMMUNICATION_USER_MENTION = 'communicationUserMention',
  COMMUNITY_NEW_MEMBER = 'communityNewMember',
}

export enum InAppNotificationState {
  Read = 'READ',
  Unread = 'UNREAD',
  Archived = 'ARCHIVED',
}

export enum InAppNotificationCategory {
  PERSONAL = 'PERSONAL',
  ADMIN = 'ADMIN',
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
}

export const useInAppNotifications = () => {
  const { user } = useUserContext();

  const { data, startPolling, stopPolling } = useInAppNotificationsQuery({
    variables: {
      receiverID: user?.user.id!,
    },
    skip: !user?.user.id,
  });

  useEffect(() => {
    if (data?.notifications?.length) {
      startPolling(POLLING_INTERVAL);
    }

    return stopPolling;
  }, [data, startPolling, stopPolling]);

  const items: InAppNotificationProps[] = useMemo(() => data?.notifications ?? [], [data]);

  return { items };
};
