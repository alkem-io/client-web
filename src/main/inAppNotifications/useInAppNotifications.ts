import { useMemo } from 'react';
import { CalloutType, CommunityContributorType, SpaceLevel } from '../../core/apollo/generated/graphql-schema';

export enum InAppNotificationType {
  COLLABORATION_CALLOUT_PUBLISHED = 'COLLABORATION_CALLOUT_PUBLISHED',
  COMMUNICATION_USER_MENTION = 'COMMUNICATION_USER_MENTION',
  COMMUNITY_NEW_MEMBER = 'COMMUNITY_NEW_MEMBER',
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
  contributor:
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
  callout:
    | {
        type: CalloutType;
        profile: {
          displayName: string;
          url: string;
        };
      }
    | undefined;
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
        contributor: undefined,
        space: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            url: '/welcome-space',
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
      },
      {
        id: '2',
        type: InAppNotificationType.COMMUNICATION_USER_MENTION,
        triggeredAt: new Date('Tue Nov 12 2024 09:01:47'),
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
        contributor: undefined,
        space: {
          level: SpaceLevel.Challenge,
          profile: {
            displayName: 'Sub Welcome',
            url: '',
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
      },
      {
        id: '3',
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.ADMIN, // this could be also a personal notification or a different type
        triggeredBy: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Admin GA',
            url: '',
            visual: {
              uri: '',
            },
          },
        },
        contributor: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Clara',
            url: '',
            visual: {
              uri: '',
            },
          },
        },
        callout: undefined,
        space: {
          level: SpaceLevel.Space,
          profile: {
            displayName: 'Welcome Space',
            url: '/welcome-space',
            visual: {
              uri: '',
            },
          },
        },
      },
      {
        id: '4',
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.PERSONAL, // this could be also a personal notification or a different type
        triggeredBy: undefined,
        contributor: undefined,
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
        },
      },
    ],
    []
  );

  return { items };
};
