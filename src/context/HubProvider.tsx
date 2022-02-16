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
  hub?: EcoverseInfoFragment;
  hubId: string;
  hubNameId: string;
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
  hubId: '',
  hubNameId: '',
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
  const { hubNameId = '' } = useUrlParams();
  const { template: platformTemplate, error: configError } = useConfig();
  const globalAspectTemplates = platformTemplate?.opportunities
    .flatMap(x => x.aspects)
    .map(x => ({ type: x, description: '' } as AspectTemplate));
  const {
    error: hubError,
    data,
    loading,
  } = useEcoverseInfoQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
    skip: !hubNameId,
  });
  const hub = data?.hub;
  const hubId = hub?.id || '';
  const displayName = hub?.displayName || '';
  const template: HubTemplate =
    hub && hub.template.aspectTemplates.length > 0
      ? { aspectTemplates: hub?.template.aspectTemplates }
      : { aspectTemplates: globalAspectTemplates || [] };
  const isPrivate = !Boolean(hub?.authorization?.anonymousReadAccess ?? true);
  const error = configError || hubError;

  const contextPrivileges = hub?.context?.authorization?.myPrivileges ?? [];

  const permissions = useMemo<EcoversePermissions>(
    () => ({
      viewerCanUpdate: hub?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      canReadAspects: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    }),
    [hub]
  );

  return (
    <EcoverseContext.Provider
      value={{
        hub,
        hubId,
        hubNameId,
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
