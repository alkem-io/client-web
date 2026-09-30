import type {
  ActorType,
  CalendarEventType,
  ForumDiscussionCategory,
  NotificationEventPayload,
  RoleName,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';

export interface InAppNotificationPayloadModel {
  type: NotificationEventPayload;
  actor?: {
    type?: ActorType;
    profile?:
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
    type?: ActorType;
    profile?:
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
    profile?:
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
    category?: ForumDiscussionCategory | string; // TODO: Payload from the notifications come with type string
    url: string;
  };
  comment?: string;
  emoji?: string;
  organizationMessage?: string;
  calendarEvent?: {
    id: string;
    type: CalendarEventType;
    profile: {
      displayName: string;
      url: string;
    };
  };
  /**
   * Community-invitation payloads (061) — role(s) offered and every Space joined on
   * accept. `spacesToJoinOnAccept` is nullable: the server returns null rather than
   * erroring when the viewer may not answer this invitation on the invited Actor's
   * behalf (e.g. an in-app row that outlived the viewer's org-admin standing).
   */
  invitation?: {
    extraRoles: RoleName[];
    invitedToParent: boolean;
    spacesToJoinOnAccept?:
      | {
          displayName: string;
          url: string;
        }[]
      | null;
  };
  /** Organization-associate application payloads (062) — set for the three application events. */
  application?: {
    id: string;
  };
  /**
   * Offered extra roles that could not be granted on accept (062, organization invitations
   * only). Present only on the admin-facing "accepted" notification.
   */
  extraRolesWithheld?: RoleName[];
}
// nullable aliases are required because you can have different nullability for the same field name conditionally by payload type
// to be mapped to InAppNotificationPayloadModel
export interface InAppNotificationIncomingPayloadModel extends InAppNotificationPayloadModel {
  nullableOrganization?: InAppNotificationPayloadModel['organization'];
  nullableActor?: InAppNotificationPayloadModel['actor'];
  nullableApplication?: InAppNotificationPayloadModel['application'];
}
