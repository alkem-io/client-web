import React, { FC } from 'react';
import { useUrlParams } from '../hooks';
import { useEcoverseInfoQuery } from '../hooks/generated/graphql';
import { EcoverseInfoFragment } from '../models/graphql-schema';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoFragment;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  isPrivate: boolean;
  loading: boolean;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: false,
  isPrivate: false,
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
  const isPrivate = !Boolean(ecoverse?.authorization?.anonymousReadAccess ?? true);

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        ecoverseNameId,
        displayName,
        isPrivate,
        loading,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
