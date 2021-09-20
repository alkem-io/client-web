import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useEcoverseInfoQuery } from '../hooks/generated/graphql';
import { EcoverseInfoFragment } from '../models/graphql-schema';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoFragment;
  ecoverseId: string;
  ecoverseNameId: string;
  loading: boolean;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: true,
  ecoverseId: '',
  ecoverseNameId: '',
});

interface EcoverseProviderProps {}

const EcoverseProvider: FC<EcoverseProviderProps> = ({ children }) => {
  const { ecoverseId: ecoverseNameId = '' } = useParams<{ ecoverseId: string }>();
  const { data, loading } = useEcoverseInfoQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId,
  });
  const ecoverse = data?.ecoverse;
  const ecoverseId = ecoverse?.id || '';

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        ecoverseNameId,
        loading,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
