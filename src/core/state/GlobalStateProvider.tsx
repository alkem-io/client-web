import { useActorRef } from '@xstate/react';
import { FC, PropsWithChildren, createContext } from 'react';
import { Actor, StateMachine } from 'xstate';
import {
  NotificationsContext,
  NotificationsEvent,
  notificationMachine,
} from './global/notifications/notificationMachine';

interface GlobalStateContextProps {
  notificationsService: Actor<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StateMachine<NotificationsContext, NotificationsEvent, any, any, any, any, any, any, any, any, any, any, any, any>
  >;
}

export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const notificationsService = useActorRef(notificationMachine);

  return <GlobalStateContext.Provider value={{ notificationsService }}>{children}</GlobalStateContext.Provider>;
};
