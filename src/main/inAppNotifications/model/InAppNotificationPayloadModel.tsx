import { NotificationEventPayload, RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface InAppNotificationPayloadModel {
  type: NotificationEventPayload;
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
    level?: SpaceLevel;
    about?: {
      profile:
        | {
            displayName?: string;
            url?: string;
            visual?: {
              uri?: string;
            };
          }
        | undefined;
    };
  };
  roomID?: string;
  originalMessageID?: string;
  commentOriginName?: string;
  comment?: string;
  commentUrl?: string;
}
