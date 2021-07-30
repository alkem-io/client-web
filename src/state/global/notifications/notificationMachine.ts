import { v4 } from 'uuid';
import { ContextFrom, EventFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

export type Severity = 'information' | 'warning' | 'error' | 'success';

export type Notification = {
  id: string;
  severity: Severity;
  message: string;
};

// export type NotificationEvent = {
//   events: {
//     PUSH: (message: string, severity?: Severity) => { notification: Notification };
//     CLEAR: (id: string) => { id: string };
//   };
// };

// export interface NotificationContext {
//   notifications: Notification[];
// }
// export type NotificationState = { value: 'active'; context: {} };

const notificationsModel = createModel(
  {
    notifications: [] as Notification[],
  },
  {
    events: {
      PUSH: (message: string, severity: Severity = 'information') => ({
        message,
        severity,
      }),
      CLEAR: (id: string) => ({
        id,
      }),
    },
  }
);

export const notificationMachine = notificationsModel.createMachine({
  id: 'notification',
  initial: 'active',
  states: {
    active: {
      on: {
        PUSH: {
          actions: notificationsModel.assign({
            notifications: (context, event) => [
              ...context.notifications,
              { id: v4(), message: event.message, severity: event.severity },
            ],
          }),
        },
        CLEAR: {
          actions: notificationsModel.assign({
            notifications: (context, event) => context.notifications.filter(x => x.id !== event.id),
          }),
        },
      },
    },
  },
});

export type NotificationsContext = ContextFrom<typeof notificationsModel>;
export type NotificationsEvent = EventFrom<typeof notificationsModel>;
