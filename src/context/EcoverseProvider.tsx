import React, { FC } from 'react';
import { useEcoverseInfoQuery } from '../hooks/generated/graphql';
import { EcoverseInfoFragment } from '../models/graphql-schema';
import { useUrlParams } from '../hooks';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoFragment;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  loading: boolean;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: false,
  ecoverseId: '',
  ecoverseNameId: '',
  displayName: '',
});

interface EcoverseProviderProps {}

const EcoverseProvider: FC<EcoverseProviderProps> = ({ children }) => {
  const { ecoverseNameId = '' } = useUrlParams();
  const { data, loading } = useEcoverseInfoQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId,
  });
  const ecoverse = data?.ecoverse;
  const ecoverseId = ecoverse?.id || '';
  const displayName = ecoverse?.displayName || '';

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        ecoverseNameId,
        displayName,
        loading,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
