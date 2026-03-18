import { createContext, type Dispatch, type PropsWithChildren } from 'react';
import { type Notification, type NotificationAction, useNotifications } from './global/notifications/useNotifications';

interface GlobalStateContextProps {
  notifications: Notification[];
  notificationsDispatch: Dispatch<NotificationAction>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const [notifications, notificationsDispatch] = useNotifications();

  return (
    <GlobalStateContext
      value={{
        notifications,
        notificationsDispatch,
      }}
    >
      {children}
    </GlobalStateContext>
  );
};
