import { NotificationEventPayload, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationPayloadSpaceCollaborationCalloutModel } from '../model/InAppNotificationPayloadSpaceCollaborationCalloutModel';

export const mapInAppNotificationPayloadSpaceCollaborationCalloutToModel = (payload?: {
  type: NotificationEventPayload;
  callout?: {
    id?: string;
    framing?: {
      id?: string;
      profile?: {
        displayName?: string;
        url?: string;
      };
    };
  };
  space?: {
    id?: string;
    level?: SpaceLevel;
    about?: {
      id?: string;
      profile?: {
        id?: string;
        displayName?: string;
        url?: string;
      };
    };
  };
}): InAppNotificationPayloadSpaceCollaborationCalloutModel | undefined => {
  if (!payload || !payload.callout || !payload.space) {
    return undefined;
  } else {
    const calloutData = payload.callout;
    if (
      !calloutData ||
      !calloutData.id ||
      !calloutData.framing ||
      !calloutData.framing.id ||
      !calloutData.framing.profile ||
      !calloutData.framing.profile.url ||
      !calloutData.framing.profile.displayName
    ) {
      return undefined;
    }
    const spaceData = payload.space;
    if (
      !spaceData ||
      !spaceData.id ||
      !spaceData.level ||
      !spaceData.about ||
      !spaceData.about.id ||
      !spaceData.about.profile ||
      !spaceData.about.profile.id ||
      !spaceData.about.profile.url ||
      !spaceData.about.profile.displayName
    ) {
      return undefined;
    }

    return {
      type: payload.type,
      callout: {
        id: calloutData.id,
        framing: {
          id: calloutData.framing.id,
          profile: {
            displayName: calloutData.framing.profile.displayName,
            url: calloutData.framing.profile.url,
          },
        },
      },
      space: {
        id: spaceData.id,
        level: spaceData.level,
        about: {
          id: spaceData.about.id,
          profile: {
            id: spaceData.about.profile.id,
            displayName: spaceData.about.profile.displayName,
            url: spaceData.about.profile.url,
          },
        },
      },
    };
  }
};
