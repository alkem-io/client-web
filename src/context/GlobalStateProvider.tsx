import { useInterpret } from '@xstate/react';
import React, { createContext, useMemo } from 'react';
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
import {
  CommunicationMessageContext,
  CommunicationMessageEvent,
  CommunicationMessageState,
  communicationMessageMachine,
} from '../state/global/entities/communityUpdateMachine';

interface GlobalStateContextProps {
  ui: {
    loginNavigationService: Interpreter<LoginNavigationContext, any, LoginNavigationEvent, LoginNavigationState>;
    userSegmentService: Interpreter<UserSegmentContext, any, UserSegmentEvent, UserSegmentState>;
  };
  entities: {
    communityUpdateService: Interpreter<
      CommunicationMessageContext,
      any,
      CommunicationMessageEvent,
      CommunicationMessageState
    >;
  };
  notificationsService: Interpreter<NotificationsContext, any, NotificationsEvent>;
}
export const GlobalStateContext = createContext<GlobalStateContextProps | undefined>(undefined);

export const GlobalStateProvider = ({ children }) => {
  const loginNavigationService = useInterpret(loginNavigationMachine);
  const userSegmentService = useInterpret(userSegmentMachine);
  const notificationsService = useInterpret(notificationMachine);
  const communityUpdateService = useInterpret(communicationMessageMachine);

  const ui = useMemo(
    () => ({ loginNavigationService, userSegmentService }),
    [loginNavigationService, userSegmentService]
  );
  const entities = useMemo(() => ({ communityUpdateService }), [communityUpdateService]);

  return (
    <GlobalStateContext.Provider
      value={{
        ui: ui,
        entities,
        notificationsService,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
