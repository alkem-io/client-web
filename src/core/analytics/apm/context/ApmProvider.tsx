import type { ApmBase } from '@elastic/apm-rum';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApmInit } from '@/core/analytics/apm/useApmInit';
import { AUTH_PAGE_PREFIXES } from '@/core/auth/authentication/constants/authentication.constants';
import type { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useAlkemioCookies } from '@/main/cookies/useAlkemioCookies';

export interface ApmContextProps {
  apm?: ApmBase;
  setUser: (user: CurrentUserModel) => void;
}

export const ApmContext = createContext<ApmContextProps>({
  apm: undefined,
  setUser: () => {},
});

export const ApmProvider = ({ children }: PropsWithChildren) => {
  const [apm, setApm] = useState<ApmBase | undefined>();
  const [user, setUser] = useState<CurrentUserModel>();
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const { consent } = useAlkemioCookies();

  const initFn = useApmInit(user);

  // Accepting mid-session starts the agent.
  useEffect(() => {
    if (consent.analysis && !isAuthPage) {
      setApm(initFn);
    }
  }, [initFn, isAuthPage, consent.analysis]);

  // A running agent cannot be stopped. When consent goes away, in this tab, in another tab or on
  // the welcome site (the cookie is shared), the page reloads without it.
  useEffect(() => {
    if (apm && !consent.analysis) {
      window.location.reload();
    }
  }, [apm, consent.analysis]);

  const value = { apm, setUser };

  return <ApmContext value={value}>{children}</ApmContext>;
};

export const ApmUserSetter = () => {
  const currentUserModel = useCurrentUserContext();
  const { userModel, isAuthenticated } = currentUserModel;
  const { setUser } = useContext(ApmContext);

  useEffect(() => {
    userModel && setUser(currentUserModel);
  }, [userModel, isAuthenticated]);

  return null;
};
