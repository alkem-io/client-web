import { useInterpret } from '@xstate/react';
import { FC, createContext, useMemo } from 'react';
import { Interpreter } from 'xstate';
import {
  notificationMachine,
  NotificationsContext,
  NotificationsEvent,
} from './global/notifications/notificationMachine';
import {
  LoginNavigationContext,
  LoginNavigationEvent,
  loginNavigationMachine,
  LoginNavigationState,
} from './global/ui/loginNavigationMachine';
import {
  UserSegmentContext,
  UserSegmentEvent,
  userSegmentMachine,
  UserSegmentState,
} from './global/ui/userSegmentMachine';

// TODO replace any with correct types below
interface GlobalStateContextProps {
  ui: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loginNavigationService: Interpreter<LoginNavigationContext, any, LoginNavigationEvent, LoginNavigationState>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userSegmentService: Interpreter<UserSegmentContext, any, UserSegmentEvent, UserSegmentState>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notificationsService: Interpreter<NotificationsContext, any, NotificationsEvent>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider: FC = ({ children }) => {
  const loginNavigationService = useInterpret(loginNavigationMachine);
  const userSegmentService = useInterpret(userSegmentMachine);
  const notificationsService = useInterpret(notificationMachine);

  const ui = useMemo(
    () => ({ loginNavigationService, userSegmentService }),
    [loginNavigationService, userSegmentService]
  );

  return (
    <GlobalStateContext.Provider
      value={{
        ui: ui,
        notificationsService,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
