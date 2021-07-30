import { useInterpret } from '@xstate/react';
import React, { createContext } from 'react';
import { Interpreter } from 'xstate';
import {
  notificationMachine,
  NotificationsContext,
  NotificationsEvent,
} from '../state/global/notifications/notificationMachine';
import {
  LoginNavigationContext,
  LoginNavigationEvent,
  loginNavigationMachine,
  LoginNavigationState,
} from '../state/global/ui/loginNavigationMachine';
import {
  UserSegmentContext,
  UserSegmentEvent,
  userSegmentMachine,
  UserSegmentState,
} from '../state/global/ui/userSegmentMachine';

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

  return (
    <GlobalStateContext.Provider
      value={{
        ui: {
          loginNavigationService,
          userSegmentService,
        },
        notificationsService,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
