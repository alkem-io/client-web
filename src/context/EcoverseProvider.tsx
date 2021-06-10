import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useEcoverseInfoQuery } from '../generated/graphql';
import { EcoverseInfoQuery } from '../types/graphql-schema';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoQuery;
  ecoverseId: string;
  loading: boolean;
  toEcoverseId: (nameID: string) => string;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: true,
  ecoverseId: '',
  toEcoverseId: (_textId: string) => {
    throw new Error('Ecoverse Context not provided! (toId)');
  },
});

interface EcoverseProviderProps {
  // ecoverseId: string;
}

const EcoverseProvider: FC<EcoverseProviderProps> = ({ children }) => {
  const { ecoverseId } = useParams<{ ecoverseId: string }>();
  const { data: ecoverse, loading: ecoverseLoading } = useEcoverseInfoQuery({
    variables: { ecoverseId },
    errorPolicy: 'all',
  });
  const loading = ecoverseLoading;

  const toEcoverseId = (_textId: string) => {
    return ecoverse?.ecoverse.id || '';
  };

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        loading,
        toEcoverseId,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
