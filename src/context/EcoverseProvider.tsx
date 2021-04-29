import React, { FC } from 'react';
import { useEcoverseInfoQuery } from '../generated/graphql';
import { EcoverseInfoQuery } from '../types/graphql-schema';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoQuery;
  loading: boolean;
  toEcoverseId: (textId: string) => string;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: true,
  toEcoverseId: (_textId: string) => {
    throw new Error('Ecoverse Context not provided! (toId)');
  },
});

const EcoverseProvider: FC<{}> = ({ children }) => {
  const { data: ecoverse, loading: ecoverseLoading } = useEcoverseInfoQuery({ errorPolicy: 'all' });
  const loading = ecoverseLoading;

  const toEcoverseId = (_textId: string) => {
    // TODO [ATS]: When multiple ecoverses are available should lookup through the ecoverses.
    return ecoverse?.ecoverse.id || '';
  };

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        loading,
        toEcoverseId,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
