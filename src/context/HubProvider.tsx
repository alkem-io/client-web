import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useConfig, useUrlParams } from '../hooks';
import { useEcoverseInfoQuery } from '../hooks/generated/graphql';
import { AspectTemplate, AuthorizationPrivilege, EcoverseInfoFragment, HubTemplate } from '../models/graphql-schema';

interface EcoversePermissions {
  viewerCanUpdate: boolean;
  canReadAspects: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoFragment;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  template: HubTemplate;
  isPrivate: boolean;
  loading: boolean;
  permissions: EcoversePermissions;
  error?: ApolloError;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: false,
  isPrivate: false,
  ecoverseId: '',
  ecoverseNameId: '',
  displayName: '',
  template: { aspectTemplates: [] },
  permissions: {
    viewerCanUpdate: false,
    canReadAspects: false,
    contextPrivileges: [],
  },
});

interface EcoverseProviderProps {}

const EcoverseProvider: FC<EcoverseProviderProps> = ({ children }) => {
  const { ecoverseNameId = '' } = useUrlParams();
  const { template: platformTemplate, error: configError } = useConfig();
  const globalAspectTemplates = platformTemplate?.opportunities
    .flatMap(x => x.aspects)
    .map(x => ({ type: x, description: '' } as AspectTemplate));
  const {
    error: hubError,
    data,
    loading,
  } = useEcoverseInfoQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId,
  });
  const ecoverse = data?.ecoverse;
  const ecoverseId = ecoverse?.id || '';
  const displayName = ecoverse?.displayName || '';
  const template: HubTemplate =
    ecoverse && ecoverse.template.aspectTemplates.length > 0
      ? { aspectTemplates: ecoverse?.template.aspectTemplates }
      : { aspectTemplates: globalAspectTemplates || [] };
  const isPrivate = !Boolean(ecoverse?.authorization?.anonymousReadAccess ?? true);
  const error = configError || hubError;

  const contextPrivileges = ecoverse?.context?.authorization?.myPrivileges ?? [];

  const permissions = useMemo<EcoversePermissions>(
    () => ({
      viewerCanUpdate: ecoverse?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      canReadAspects: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    }),
    [ecoverse]
  );

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        ecoverseId,
        ecoverseNameId,
        template,
        permissions,
        displayName,
        isPrivate,
        loading,
        error,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
