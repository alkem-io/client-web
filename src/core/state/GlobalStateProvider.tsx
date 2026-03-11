import { useActorRef } from '@xstate/react';
import { createContext, type PropsWithChildren } from 'react';
import type { Actor, StateMachine } from 'xstate';

import {
  type NotificationsContext,
  type NotificationsEvent,
  notificationMachine,
} from './global/notifications/notificationMachine';

// TODO replace any with correct types below
interface GlobalStateContextProps {
  notificationsService: Actor<
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
