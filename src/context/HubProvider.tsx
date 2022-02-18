import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useConfig, useUrlParams } from '../hooks';
import { useHubInfoQuery } from '../hooks/generated/graphql';
import { AspectTemplate, AuthorizationPrivilege, HubInfoFragment, HubTemplate } from '../models/graphql-schema';

interface HubPermissions {
  viewerCanUpdate: boolean;
  canReadAspects: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface HubContextProps {
  hub?: HubInfoFragment;
  hubId: string;
  hubNameId: string;
  displayName: string;
  template: HubTemplate;
  isPrivate: boolean;
  loading: boolean;
  permissions: HubPermissions;
  error?: ApolloError;
}

const HubContext = React.createContext<HubContextProps>({
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

interface HubProviderProps {}

const HubProvider: FC<HubProviderProps> = ({ children }) => {
  const { hubNameId = '' } = useUrlParams();
  const { template: platformTemplate, error: configError } = useConfig();
  const globalAspectTemplates = platformTemplate?.opportunities
    .flatMap(x => x.aspects)
    .map(x => ({ type: x, description: '' } as AspectTemplate));
  const {
    error: hubError,
    data,
    loading,
  } = useHubInfoQuery({
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

  const permissions = useMemo<HubPermissions>(
    () => ({
      viewerCanUpdate: hub?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      canReadAspects: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    }),
    [hub]
  );

  return (
    <HubContext.Provider
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
    </HubContext.Provider>
  );
};

export { HubProvider, HubContext };
