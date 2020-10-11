import React, { FC } from 'react';
import { useEcoverseListQuery } from '../generated/graphql';
import { Ecoverse, Challenge } from '../models';
import { nameToAltId } from '../utils/nameToAltId';

export interface AppContext {
  ecoverse: Ecoverse;
  challenges: Challenge[];
}

const appContext = React.createContext<AppContext>({
  ecoverse: { name: '' },
  challenges: [],
});

const AppProvider: FC = ({ children }) => {
  const { data } = useEcoverseListQuery();

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
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export { AppProvider, appContext };
