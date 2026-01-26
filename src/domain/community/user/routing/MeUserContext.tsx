import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

type MeUserContextValue = {
  userId: string;
};

const MeUserContext = createContext<MeUserContextValue | undefined>(undefined);

type MeUserProviderProps = PropsWithChildren<{
  userId: string;
}>;

const MeUserProvider = ({ userId, children }: MeUserProviderProps) => {
  const value = useMemo(() => ({ userId }), [userId]);

  return <MeUserContext value={value}>{children}</MeUserContext>;
};

const useMeUserContext = () => useContext(MeUserContext);

export { MeUserContext, MeUserProvider, useMeUserContext };
