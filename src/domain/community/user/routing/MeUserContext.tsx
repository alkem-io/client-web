import { createContext, type PropsWithChildren, useContext } from 'react';

type MeUserContextValue = {
  userId: string;
};

const MeUserContext = createContext<MeUserContextValue | undefined>(undefined);

type MeUserProviderProps = PropsWithChildren<{
  userId: string;
}>;

const MeUserProvider = ({ userId, children }: MeUserProviderProps) => {
  const value = {
    userId,
  };

  return <MeUserContext value={value}>{children}</MeUserContext>;
};

const useMeUserContext = () => useContext(MeUserContext);

export { MeUserContext, MeUserProvider, useMeUserContext };
