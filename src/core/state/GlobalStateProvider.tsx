import { useActorRef } from '@xstate/react';
import { PropsWithChildren, createContext } from 'react';
import { Actor, StateMachine } from 'xstate';

import {
  notificationMachine,
  NotificationsContext,
  NotificationsEvent,
} from './global/notifications/notificationMachine';

// TODO replace any with correct types below
interface GlobalStateContextProps {
  notificationsService: Actor<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StateMachine<NotificationsContext, NotificationsEvent, any, any, any, any, any, any, any, any, any, any, any, any>
  >;
}

export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const notificationsService = useActorRef(notificationMachine);

  return (
    <GlobalStateContext
      value={{
        notificationsService,
      }}
    >
      {children}
    </GlobalStateContext>
  );
};
