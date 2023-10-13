import { createContext, PropsWithChildren, useEffect, useState, useMemo, useContext } from 'react';
import { ApmBase } from '@elastic/apm-rum';
import { useApmInit } from '../useApmInit';
import { useUserContext } from '../../../../domain/community/user';
import { User } from '../../../apollo/generated/graphql-schema';

export interface ApmContextProps {
  apm?: ApmBase;
  setUser: (user: User & { isAuthenticated: boolean }) => void;
}

export const ApmContext = createContext<ApmContextProps>({
  apm: undefined,
  setUser: () => {},
});

interface Props extends PropsWithChildren<{}> {}

export const ApmProvider = ({ children }: Props) => {
  const [apm, setApm] = useState<ApmBase | undefined>();
  const [user, setUser] = useState<(User & { isAuthenticated: boolean }) | undefined>();

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
