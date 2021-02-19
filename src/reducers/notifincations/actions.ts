import { CLEAR_NOTIFICATION, NotificationActionTypes, PUSH_NOTIFICATION, Severity } from './types';

export function pushNotification(message: string, severity: Severity = 'information'): NotificationActionTypes {
  return {
    type: PUSH_NOTIFICATION,
    payload: {
      message,
      severity,
    },
  };
}

export function clearNotification(id: string): NotificationActionTypes {
  return {
    type: CLEAR_NOTIFICATION,
    payload: { id },
  };
}
