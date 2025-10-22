import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import {
  InAppNotificationIncomingPayloadModel,
  InAppNotificationPayloadModel,
} from '../model/InAppNotificationPayloadModel';

export type IncomingInAppNotification = {
  id: string;
  type: NotificationEvent;
  triggeredAt: Date;
  state: NotificationEventInAppState;
  category: NotificationEventCategory;
  triggeredBy?: {
    profile?: {
      displayName?: string;
      url?: string;
      visual?: {
        uri?: string;
      };
    };
  };
  payload: InAppNotificationIncomingPayloadModel;
};

export const mapInAppNotificationToModel = (
  inAppNotification?: IncomingInAppNotification
): InAppNotificationModel | undefined => {
  if (!inAppNotification || !inAppNotification.triggeredBy) {
    return undefined;
  } else {
    const profileData = inAppNotification.triggeredBy.profile;
    if (!profileData || !profileData.url || !profileData.displayName || !profileData.visual) {
      return undefined;
    }
    return {
      id: inAppNotification.id,
      type: inAppNotification.type,
      triggeredAt: inAppNotification.triggeredAt,
      state: inAppNotification.state,
      category: inAppNotification.category,
      triggeredBy: {
        profile: {
          displayName: profileData.displayName,
          url: profileData.url,
          visual: {
            uri: profileData.visual.uri,
          },
        },
      },
      payload: mapIncomingToPayloadModel(inAppNotification.payload),
    } as InAppNotificationModel;
  }
};

const mapIncomingToPayloadModel = (
  incomingInAppPayload: InAppNotificationIncomingPayloadModel
): InAppNotificationPayloadModel => {
  const clonedPayload: InAppNotificationIncomingPayloadModel = { ...incomingInAppPayload };
  // Map the nullable aliases to their corresponding fields
  // is the alias is defined the normal field would be undefined and vice versa
  clonedPayload.organization = incomingInAppPayload.nullableOrganization ?? incomingInAppPayload.organization;
  // Remove nullable fields as they are not needed in the model
  delete clonedPayload.nullableOrganization;

  return clonedPayload as InAppNotificationPayloadModel;
};
