/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 } from 'uuid';
import { assign, createMachine } from 'xstate';

export type Severity = 'info' | 'warning' | 'error' | 'success';

type Notification = {
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

export const notificationMachine = createMachine<
  NotificationsContext,
  NotificationsEvent,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>({
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
            notifications: (
              context: NotificationsContext,
              event: { type: typeof PUSH_NOTIFICATION; payload: { message: string; severity?: Severity } }
            ) => [
              ...context.notifications,
              { id: v4(), message: event.payload.message, severity: event.payload.severity || 'info' },
            ],
          }),
        },
        CLEAR: {
          actions: assign({
            notifications: (
              context: NotificationsContext,
              event: { type: typeof CLEAR_NOTIFICATION; payload: { id: string } }
            ) => context.notifications.filter(x => x.id !== event.payload.id),
          }),
        },
      },
    },
  },
});
