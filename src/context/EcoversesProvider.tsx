import React, { FC } from 'react';
import { useEcoversesQuery } from '../generated/graphql';
import { EcoverseDetailsFragment } from '../types/graphql-schema';
import { ApolloError } from '@apollo/client';

interface EcoversesContextProps {
  ecoverses: EcoverseDetailsFragment[];
  loading: boolean;
  error?: ApolloError;
  toEcoversesId: (nameID: string) => string;
}

const EcoversesContext = React.createContext<EcoversesContextProps>({
  ecoverses: [],
  loading: true,
  error: undefined,
  toEcoversesId: (_textId: string) => {
    throw new Error('Ecoverses Context not provided! (toId)');
  },
});

const EcoversesProvider: FC<{}> = ({ children }) => {
  const { data, loading: ecoverseLoading, error } = useEcoversesQuery();
  const loading = ecoverseLoading;

  const ecoverses = data?.ecoverses || [];
  const toEcoversesId = (_textId: string) => {
    return ecoverses?.find(e => e.nameID === _textId)?.nameID || '';
  };

  return (
    <EcoversesContext.Provider
      value={{
        ecoverses,
        loading,
        error,
        toEcoversesId,
      }}
    >
      {children}
    </EcoversesContext.Provider>
  );
};

export { EcoversesProvider, EcoversesContext };
