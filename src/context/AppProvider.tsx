import React, { FC } from 'react';
import { useEcoverseNameQuery } from '../generated/graphql';
import { useAuthentication } from '../hooks';
import { Challenge, Ecoverse } from '../models';

export interface AppContext {
  ecoverse: Ecoverse;
  challenges: Challenge[];
  handleSignIn: () => void;
  handleSignOut: () => void;
  loading: boolean;
}

const appContext = React.createContext<AppContext>({
  ecoverse: { name: '' },
  challenges: [],
  handleSignIn: () => null,
  handleSignOut: () => null,
  loading: false,
});

const AppProvider: FC = ({ children }) => {
  const { data, loading: ecoverseLoading } = useEcoverseNameQuery();
  const { handleSignIn, handleSignOut } = useAuthentication();

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
        loading: ecoverseLoading,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export { AppProvider, appContext };
