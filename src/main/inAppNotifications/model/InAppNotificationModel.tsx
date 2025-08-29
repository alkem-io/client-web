import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationPayloadModel } from './InAppNotificationPayloadModel';

export interface InAppNotificationModel {
  id: string;
  type: NotificationEvent;
  triggeredAt: Date;
  state: NotificationEventInAppState;
  category: NotificationEventCategory;
  triggeredBy: {
    profile: {
      displayName: string;
      url: string;
      visual: {
        uri: string;
      };
    };
  };
  payload: InAppNotificationPayloadModel;
}
