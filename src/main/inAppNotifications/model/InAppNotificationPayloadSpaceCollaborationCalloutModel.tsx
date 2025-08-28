import { NotificationEventPayload, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationPayloadModel } from './InAppNotificationPayloadModel';

export interface InAppNotificationPayloadSpaceCollaborationCalloutModel extends InAppNotificationPayloadModel {
  type: NotificationEventPayload;
  callout: {
    id: string;
    framing: {
      id: string;
      profile: {
        displayName: string;
        url: string;
      };
    };
  };
  space: {
    id: string;
    level: SpaceLevel;
    about: {
      id: string;
      profile: {
        id: string;
        displayName: string;
        url: string;
      };
    };
  };
}
