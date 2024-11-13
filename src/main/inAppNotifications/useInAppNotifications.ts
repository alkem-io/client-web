import { useMemo } from 'react';
import {
  CalloutType,
  CommunityContributorType,
  CommunityRoleType,
  SpaceLevel,
} from '../../core/apollo/generated/graphql-schema';

enum InAppNotificationType {
  COLLABORATION_CALLOUT_PUBLISHED = 'COLLABORATION_CALLOUT_PUBLISHED',
  COMMUNICATION_USER_MENTION = 'COMMUNICATION_USER_MENTION',
  COMMUNITY_NEW_MEMBER = 'COMMUNITY_NEW_MEMBER',
}

enum InAppNotificationActions {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export enum InAppNotificationState {
  READ = 'READ',
  UNREAD = 'UNREAD',
  ARCHIVED = 'ARCHIVED',
}

enum InAppNotificationCategory {
  PERSONAL = 'PERSONAL',
  ADMIN = 'ADMIN',
}

interface NotificationProps {
  type: InAppNotificationType;
  triggeredAt: Date;
  action: InAppNotificationActions | undefined;
  state: InAppNotificationState;
  category: InAppNotificationCategory;
  triggeredBy: {
    displayName: string;
    url: string;
    visual:
      | {
          uri: string;
        }
      | undefined;
    type: CommunityContributorType;
  };
  parentSpace:
    | {
        level: SpaceLevel;
        profile: {
          displayName: string;
          visual:
            | {
                uri: string;
              }
            | undefined;
        };
      }
    | undefined;
  callout:
    | {
        type: CalloutType;
        profile: {
          displayName: string;
          url: string;
        };
      }
    | undefined;

  // TODO: 1.
  // For the 'join' notification type we need:
  // 1.1. Contributor Profile (the prop to be specified or use triggeredBy?);
  // 1.2. The CommunityRoleType (Member, Admin, Lead);
  // suggested below:
  space:
    | {
        level: SpaceLevel;
        profile: {
          displayName: string;
          visual: {
            uri: string;
          };
        };
        communityRole: CommunityRoleType;
      }
    | undefined;

  // TODO: 2.
  // For the comments notification type we need:
  // 2.1. the comment text;
  // 2.2. commentOrigin which shold be the profile of the entitiy (callout is insufficient);
}

export const useInAppNotifications = () => {
  const items: NotificationProps[] = useMemo(
    () => [
      {
        type: InAppNotificationType.COLLABORATION_CALLOUT_PUBLISHED,
        triggeredAt: new Date('Tue Nov 12 2024 11:04:30'),
        action: undefined,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          displayName: 'John Doe',
          url: '',
          type: CommunityContributorType.User,
          visual: {
            uri: '',
          },
        },
        parentSpace: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            visual: {
              uri: '',
            },
          },
        },
        callout: {
          type: CalloutType.Post,
          profile: {
            displayName: 'Fancy Post',
            url: '',
          },
        },
        space: undefined,
      },
      {
        type: InAppNotificationType.COMMUNICATION_USER_MENTION,
        triggeredAt: new Date('Tue Nov 12 2024 09:01:47'),
        action: undefined,
        state: InAppNotificationState.READ,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          displayName: 'Carvahlio',
          url: '',
          type: CommunityContributorType.User,
          visual: {
            uri: '',
          },
        },
        parentSpace: {
          level: SpaceLevel.Challenge,
          profile: {
            displayName: 'Sub Welcome',
            visual: {
              uri: '',
            },
          },
        },
        callout: {
          type: CalloutType.Post,
          profile: {
            displayName: 'Fancy Post in subspace',
            url: '',
          },
        },
        space: undefined,
      },
      {
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        action: undefined,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.ADMIN, // this could be also a personal notification or a different type
        triggeredBy: {
          displayName: 'Clara',
          url: '',
          type: CommunityContributorType.User,
          visual: {
            uri: '',
          },
        },
        parentSpace: undefined,
        callout: undefined,
        space: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            visual: {
              uri: '',
            },
          },
          communityRole: CommunityRoleType.Member,
        },
      },
    ],
    []
  );

  return { items };
};
