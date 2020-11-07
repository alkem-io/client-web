import React, { FC } from 'react';
import { useEcoverseNameQuery } from '../generated/graphql';
import { useAuthentication } from '../hooks';
import { Challenge, Ecoverse } from '../models';

export interface AppContext {
  ecoverse: Ecoverse;
  challenges: Challenge[];
  loading: boolean;
}

const appContext = React.createContext<AppContext>({
  ecoverse: { name: '' },
  challenges: [],
  loading: false,
});

const AppProvider: FC = ({ children }) => {
  const { data, loading: ecoverseLoading } = useEcoverseNameQuery();

  const ecoverse = {
    name: data ? data.name : '',
  };

  return (
    <appContext.Provider
      value={{
        ecoverse,
        challenges: [],
        loading: ecoverseLoading,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export { AppProvider, appContext };
