import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../hooks';
import { useEcoverseInfoQuery } from '../hooks/generated/graphql';
import { AuthorizationPrivilege, EcoverseInfoFragment } from '../models/graphql-schema';

interface EcoversePermissions {
  viewerCanUpdate: boolean;
}

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoFragment;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  isPrivate: boolean;
  loading: boolean;
  permissions: EcoversePermissions;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: false,
  isPrivate: false,
  ecoverseId: '',
  ecoverseNameId: '',
  displayName: '',
  permissions: {
    viewerCanUpdate: false,
  },
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

  const permissions = useMemo<EcoversePermissions>(
    () => ({
      viewerCanUpdate: ecoverse?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
    }),
    [ecoverse]
  );

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        ecoverseNameId,
        permissions,
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
