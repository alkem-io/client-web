import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { InAppNotificationPayloadModel } from '../model/InAppNotificationPayloadModel';

export const mapInAppNotificationToModel = (inAppNotification?: {
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
  payload: InAppNotificationPayloadModel;
}): InAppNotificationModel | undefined => {
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
      payload: inAppNotification.payload,
    } as InAppNotificationModel;
  }
};
