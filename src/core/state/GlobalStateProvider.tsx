import { useActorRef } from '@xstate/react';
import { FC, PropsWithChildren, createContext } from 'react';
import { notificationMachine } from './global/notifications/notificationMachine';

// TODO replace any with correct types below
interface GlobalStateContextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notificationsService: any;
}

export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const notificationsService = useActorRef(notificationMachine);

  return <GlobalStateContext.Provider value={{ notificationsService }}>{children}</GlobalStateContext.Provider>;
};
