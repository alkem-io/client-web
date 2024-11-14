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
            displayName: 'Denise',
            url: '',
            visual: {
              uri: 'http://localhost:3000/api/private/rest/storage/document/1461dbff-34ce-4871-a737-5c3a325266d9',
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
            displayName: 'AA',
            url: '',
            visual: {
              uri: 'http://localhost:3000/api/private/rest/storage/document/8ee9509d-cb31-4a3d-ba49-4733a9aaac83',
            },
          },
        },
        contributor: undefined,
        space: {
          level: SpaceLevel.Challenge,
          profile: {
            displayName: 'Sub Welcome',
            url: '/welcome-space/challenges/sdfsdf2',
            visual: {
              uri: 'http://localhost:3000/api/private/rest/storage/document/78a65ce2-d30d-46ba-bbd0-6a69fc36528b',
            },
          },
        },
        callout: {
          type: CalloutType.Post,
          profile: {
            displayName: 'Fancy Post in subspace',
            url: 'http://localhost:3000/welcome-space/challenges/sdfsdf2/collaboration/fancypost',
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
              uri: 'http://localhost:3000/api/private/rest/storage/document/8ee9509d-cb31-4a3d-ba49-4733a9aaac83',
            },
          },
        },
        contributor: {
          type: CommunityContributorType.User,
          profile: {
            displayName: 'Denise',
            url: '',
            visual: {
              uri: 'http://localhost:3000/api/private/rest/storage/document/1461dbff-34ce-4871-a737-5c3a325266d9',
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
              uri: 'http://localhost:3000/api/private/rest/storage/document/af4d0ae0-64ae-42a8-a166-ff348d254cd6',
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
            url: '/welcome-space',
            visual: {
              uri: 'http://localhost:3000/api/private/rest/storage/document/af4d0ae0-64ae-42a8-a166-ff348d254cd6',
            },
          },
        },
      },
    ],
    []
  );

  return { items };
};
