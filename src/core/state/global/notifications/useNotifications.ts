import { useReducer } from 'react';
import { v4 } from 'uuid';

export type Severity = 'info' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
  numericCode?: number;
};

export const PUSH_NOTIFICATION = 'PUSH';
export const CLEAR_NOTIFICATION = 'CLEAR';

export type NotificationAction =
  | { type: typeof PUSH_NOTIFICATION; payload: { message: string; severity?: Severity; numericCode?: number } }
  | { type: typeof CLEAR_NOTIFICATION; payload: { id: string } };

const notificationReducer = (notifications: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case PUSH_NOTIFICATION:
      return [
        ...notifications,
        {
          id: v4(),
          message: action.payload.message,
          severity: action.payload.severity || 'info',
          numericCode: action.payload.numericCode,
        },
      ];
    case CLEAR_NOTIFICATION:
      return notifications.filter(n => n.id !== action.payload.id);
    default:
      return notifications;
  }
};

export const useNotifications = () => {
  return useReducer(notificationReducer, []);
};
