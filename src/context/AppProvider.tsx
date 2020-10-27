import React, { FC } from 'react';
import { useEcoverseNameQuery } from '../generated/graphql';
import { useAuthentication } from '../hooks';
import { Challenge, Ecoverse } from '../models';

export interface AppContext {
  ecoverse: Ecoverse;
  challenges: Challenge[];
  handleSignIn: () => void;
  handleSignOut: () => void;
  enableAuthentication: boolean;
}

const appContext = React.createContext<AppContext>({
  ecoverse: { name: '' },
  challenges: [],
  handleSignIn: () => null,
  handleSignOut: () => null,
  enableAuthentication: true,
});

interface AppProviderProps {
  enableAuthentication: boolean;
}

const AppProvider: FC<AppProviderProps> = ({ enableAuthentication, children }) => {
  const { data } = useEcoverseNameQuery();

  const { handleSignIn, handleSignOut } = useAuthentication(enableAuthentication);

  const ecoverse = {
    name: data ? data.name : '',
  };

  return (
    <appContext.Provider
      value={{
        ecoverse,
        challenges: [],
        handleSignIn,
        handleSignOut,
        enableAuthentication,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export { AppProvider, appContext };
