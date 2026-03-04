import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { ApmBase } from '@elastic/apm-rum';
import { useLocation } from 'react-router-dom';
import { useApmInit } from '@/core/analytics/apm/useApmInit';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';
import { AUTH_PAGE_PREFIXES } from '@/core/auth/authentication/constants/authentication.constants';

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

  const initFn = useApmInit(user);

  useEffect(() => {
    if (!isAuthPage) {
      setApm(initFn);
    }
  }, [initFn, isAuthPage]);

  const value = useMemo(() => ({ apm, setUser }), [apm]);

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
