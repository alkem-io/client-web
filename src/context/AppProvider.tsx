import React, { FC } from 'react';
import { useEcoverseListQuery } from '../generated/graphql';
import { useAuthentication } from '../hooks';
import { Ecoverse, Challenge } from '../models';
import { nameToAltId } from '../utils/nameToAltId';

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
  const { data } = useEcoverseListQuery();

  const { handleSignIn, handleSignOut } = useAuthentication(enableAuthentication);

  const ecoverse = {
    name: data ? data.name : '',
  };

  const challenges: Challenge[] = data
    ? data.challenges.map(x => ({
        id: x.id,
        name: x.name,
        altId: nameToAltId(x.name),
      }))
    : [];

  return (
    <appContext.Provider
      value={{
        ecoverse,
        challenges,
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
