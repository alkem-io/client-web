import { useMemo } from 'react';
import {
  CalloutType,
  CommunityContributorType,
  CommunityRoleType,
  SpaceLevel,
} from '../../core/apollo/generated/graphql-schema';

export enum InAppNotificationType {
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

export enum InAppNotificationCategory {
  PERSONAL = 'PERSONAL',
  ADMIN = 'ADMIN',
}

export interface InAppNotificationProps {
  id: string;
  type: InAppNotificationType;
  triggeredAt: Date;
  action: InAppNotificationActions | undefined;
  state: InAppNotificationState;
  category: InAppNotificationCategory;
  triggeredBy:
    | {
        type: CommunityContributorType;
        profile:
          | {
              displayName: string;
              url: string;
              visual:
                | {
                    uri: string;
                  }
                | undefined;
            }
          | undefined;
      }
    | undefined;
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
          url: string;
          visual: {
            uri: string;
          };
        };
        communityRole?: CommunityRoleType;
      }
    | undefined;

  // TODO: 2.
  // For the comments notification type we need:
  // 2.1. the comment text;
  // 2.2. commentOrigin which shold be the profile of the entitiy (callout is insufficient);
}

export const useInAppNotifications = () => {
  const items: InAppNotificationProps[] = useMemo(
    () => [
      {
        id: '1',
        type: InAppNotificationType.COLLABORATION_CALLOUT_PUBLISHED,
        triggeredAt: new Date('Tue Nov 12 2024 11:04:30'),
        action: undefined,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'John Doe',
            url: '',
            visual: {
              uri: '',
            },
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
        id: '2',
        type: InAppNotificationType.COMMUNICATION_USER_MENTION,
        triggeredAt: new Date('Tue Nov 12 2024 09:01:47'),
        action: undefined,
        state: InAppNotificationState.READ,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Carvahlio',
            url: '',
            visual: {
              uri: '',
            },
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
        id: '3',
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        action: undefined,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.ADMIN, // this could be also a personal notification or a different type
        triggeredBy: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Clara',
            url: '',
            visual: {
              uri: '',
            },
          },
        },
        parentSpace: undefined,
        callout: undefined,
        space: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            url: '',
            visual: {
              uri: '',
            },
          },
          communityRole: CommunityRoleType.Member,
        },
      },
      {
        id: '4',
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        action: undefined,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.PERSONAL, // this could be also a personal notification or a different type
        triggeredBy: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Admin Admin',
            url: '',
            visual: {
              uri: '',
            },
          },
        },
        parentSpace: undefined,
        callout: undefined,
        space: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            url: '',
            visual: {
              uri: '',
            },
          },
          communityRole: undefined,
        },
      },
    ],
    []
  );

  return { items };
};
