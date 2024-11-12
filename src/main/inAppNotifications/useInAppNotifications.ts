import { useMemo } from 'react';

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

export const useInAppNotifications = () => {
  const items = useMemo(
    () => [
      {
        type: InAppNotificationType.COLLABORATION_CALLOUT_PUBLISHED,
        triggeredAt: new Date('Tue Nov 12 2024 11:04:30'),
        action: InAppNotificationActions.CREATE,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          displayName: 'John Doe',
          url: '',
          visual: {
            uri: '',
          },
        },
        resourceProfile: {
          displayName: 'Fancy Callout',
          url: '',
        },
      },
      {
        type: InAppNotificationType.COMMUNICATION_USER_MENTION,
        triggeredAt: new Date('Tue Nov 12 2024 09:01:47'),
        action: null,
        state: InAppNotificationState.READ,
        category: InAppNotificationCategory.PERSONAL,
        triggeredBy: {
          displayName: 'Carvahlio',
          url: '',
          visual: {
            uri: '',
          },
        },
        resourceProfile: {
          displayName: 'A Callout with comments',
          url: '',
        },
      },
      {
        type: InAppNotificationType.COMMUNITY_NEW_MEMBER,
        triggeredAt: new Date('Tue Nov 11 2024 16:12:44'),
        action: null,
        state: InAppNotificationState.UNREAD,
        category: InAppNotificationCategory.ADMIN,
        triggeredBy: {
          displayName: 'Clara',
          url: '',
          visual: {
            uri: '',
          },
        },
        resourceProfile: null,
      },
    ],
    []
  );

  return { items };
};
