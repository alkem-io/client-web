import React, { FC } from 'react';
import { useEcoversesQuery } from '../generated/graphql';
import { EcoverseDetailsFragment } from '../types/graphql-schema';

interface EcoversesContextProps {
  ecoverses: EcoverseDetailsFragment[];
  loading: boolean;
  toEcoversesId: (nameID: string) => string;
}

const EcoversesContext = React.createContext<EcoversesContextProps>({
  ecoverses: [],
  loading: true,
  toEcoversesId: (_textId: string) => {
    throw new Error('Ecoverses Context not provided! (toId)');
  },
});

const EcoversesProvider: FC<{}> = ({ children }) => {
  const { data, loading: ecoverseLoading } = useEcoversesQuery();
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
        toEcoversesId,
      }}
    >
      {children}
    </EcoversesContext.Provider>
  );
};

export { EcoversesProvider, EcoversesContext };
