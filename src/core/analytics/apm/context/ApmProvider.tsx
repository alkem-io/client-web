import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { ApmBase } from '@elastic/apm-rum';
import { useApmInit } from '@/core/analytics/apm/useApmInit';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';

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

  const initFn = useApmInit(user);

  useEffect(() => {
    setApm(initFn);
  }, [initFn]);

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
