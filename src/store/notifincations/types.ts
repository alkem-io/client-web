export const PUSH_NOTIFICATION = 'PUSH_NOTIFICATION';
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';

export type Severity = 'information' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
};

export interface NotificationPayload {
  message: string;
  severity: Severity;
}

export interface PushNotificationAction {
  type: typeof PUSH_NOTIFICATION;
  payload: NotificationPayload;
}

export interface ClearNotificationAction {
  type: typeof CLEAR_NOTIFICATION;
  payload: { id: string };
}

export interface NotificationState {
  notifications: Notification[];
}

export type NotificationActionTypes = PushNotificationAction | ClearNotificationAction;
