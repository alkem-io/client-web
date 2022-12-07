import { useInterpret } from '@xstate/react';
import React, { createContext, useMemo } from 'react';
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

interface GlobalStateContextProps {
  ui: {
    loginNavigationService: Interpreter<LoginNavigationContext, any, LoginNavigationEvent, LoginNavigationState>;
    userSegmentService: Interpreter<UserSegmentContext, any, UserSegmentEvent, UserSegmentState>;
  };
  notificationsService: Interpreter<NotificationsContext, any, NotificationsEvent>;
}
export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider = ({ children }) => {
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
