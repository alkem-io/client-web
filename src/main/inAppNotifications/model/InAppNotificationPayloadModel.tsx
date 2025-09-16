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
  user?: {
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
  organization?: {
    id: string;
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
            description?: string;
            avatar?: {
              uri?: string;
            };
            cardBanner?: {
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
  userMessage?: string;
  update?: string; // returning ID, todo: get the content of the update
  spaceCommunicationMessage?: string;
  role?: string;
  discussion?: {
    id: string;
    displayName: string;
    description?: string;
    category?: string;
    url: string;
  };
  comment?: string;
  userEmail?: string;
  userDisplayName?: string;
  organizationMessage?: string;
}
