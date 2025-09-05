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
  messageDetails?: {
    message: string;
    parent: {
      displayName: string;
      url: string;
    };
    room: {
      id: string;
    };
  };
  update?: string; // returning ID, todo: get the content of the update
  spaceCommunicationMessage?: string;
}
