import { v4 } from 'uuid';
import { assign, createMachine } from 'xstate';

export type Severity = 'information' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
};

export const PUSH_NOTIFICATION = 'PUSH';
export const CLEAR_NOTIFICATION = 'CLEAR';

export type NotificationsContext = {
  notifications: Notification[];
};
export type NotificationsEvent =
  | { type: typeof PUSH_NOTIFICATION; payload: { message: string; severity?: Severity } }
  | { type: typeof CLEAR_NOTIFICATION; payload: { id: string } };
export type LoginNavigationState = { value: 'visible'; context: {} } | { value: 'hidden'; context: {} };

export const notificationMachine = createMachine<NotificationsContext, NotificationsEvent>({
  id: 'notification',
  initial: 'active',
  context: {
    notifications: [],
  },
  states: {
    active: {
      on: {
        PUSH: {
          actions: assign({
            notifications: (context, event) => [
              ...context.notifications,
              { id: v4(), message: event.payload.message, severity: event.payload.severity || 'information' },
            ],
          }),
        },
        CLEAR: {
          actions: assign({
            notifications: (context, event) => context.notifications.filter(x => x.id !== event.payload.id),
          }),
        },
      },
    },
  },
});
