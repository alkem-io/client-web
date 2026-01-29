import { v4 } from 'uuid';
import { assign, createMachine } from 'xstate';

export type Severity = 'info' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
  numericCode?: number;
};

export const PUSH_NOTIFICATION = 'PUSH';
export const CLEAR_NOTIFICATION = 'CLEAR';

export type NotificationsContext = {
  notifications: Notification[];
};
export type NotificationsEvent =
  | { type: typeof PUSH_NOTIFICATION; payload: { message: string; severity?: Severity; numericCode?: number } }
  | { type: typeof CLEAR_NOTIFICATION; payload: { id: string } };

type NotificationMachineTypes = {
  context: NotificationsContext;
  events: NotificationsEvent;
};

export const notificationMachine = createMachine({
  id: 'notification',
  initial: 'active',
  context: {
    notifications: [],
  },
  types: {} as NotificationMachineTypes,
  states: {
    active: {
      on: {
        PUSH: {
          actions: assign({
            notifications: ({ context, event }) => [
              ...context.notifications,
              {
                id: v4(),
                message: event.payload.message,
                severity: event.payload.severity || 'info',
                numericCode: event.payload.numericCode,
              },
            ],
          }),
        },
        CLEAR: {
          actions: assign({
            notifications: ({ context, event }) => context.notifications.filter(x => x.id !== event.payload.id),
          }),
        },
      },
    },
  },
});
