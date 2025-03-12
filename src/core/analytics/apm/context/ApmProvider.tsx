import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { ApmBase } from '@elastic/apm-rum';
import { useApmInit } from '@/core/analytics/apm/useApmInit';
import { UserMetadata, useUserContext } from '@/domain/community/user';

export interface ApmContextProps {
  apm?: ApmBase;
  setUser: (user: UserMetadata['user'] & { isAuthenticated: boolean }) => void;
}

export const ApmContext = createContext<ApmContextProps>({
  apm: undefined,
  setUser: () => {},
});

export const ApmProvider = ({ children }: PropsWithChildren) => {
  const [apm, setApm] = useState<ApmBase | undefined>();
  const [user, setUser] = useState<(UserMetadata['user'] & { isAuthenticated: boolean }) | undefined>();

  const initFn = useApmInit(user);

  useEffect(() => setApm(initFn), [initFn]);

  const value = useMemo(() => ({ apm, setUser }), [apm]);

  return <ApmContext.Provider value={value}>{children}</ApmContext.Provider>;
};

export const ApmUserSetter = () => {
  const { user, isAuthenticated } = useUserContext();
  const { setUser } = useContext(ApmContext);

  useEffect(() => user?.user && setUser({ ...user.user, isAuthenticated }), [user?.user, isAuthenticated]);

  return null;
};
