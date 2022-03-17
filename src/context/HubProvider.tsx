import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useConfig, useUrlParams, useUserContext } from '../hooks';
import { useHubProviderQuery } from '../hooks/generated/graphql';
import { AuthorizationPrivilege, HubInfoFragment, HubTemplate, Visual } from '../models/graphql-schema';

interface HubPermissions {
  viewerCanUpdate: boolean;
  canReadAspects: boolean;
  canReadChallenges: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface HubContextProps {
  hub?: HubInfoFragment;
  hubId: string;
  hubNameId: string;
  displayName: string;
  communityId: string;
  visuals: Visual[];
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
  communityId: '',
  visuals: [],
  template: { aspectTemplates: [] },
  permissions: {
    viewerCanUpdate: false,
    canReadAspects: false,
    canReadChallenges: false,
    communityReadAccess: false,
    contextPrivileges: [],
  },
});

interface HubProviderProps {}

const HubProvider: FC<HubProviderProps> = ({ children }) => {
  const { hubNameId = '' } = useUrlParams();
  const { template: platformTemplate, error: configError } = useConfig();
  const { user } = useUserContext();
  const globalAspectTemplates = platformTemplate?.hubs[0].aspects;

  const {
    error: hubError,
    data,
    loading,
  } = useHubProviderQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
    skip: !hubNameId,
  });
  const hub = data?.hub;
  const hubId = hub?.id || '';
  const displayName = hub?.displayName || '';
  const communityId = hub?.community?.id ?? '';
  const visuals = hub?.context?.visuals ?? [];
  const template: HubTemplate =
    hub && hub.template.aspectTemplates.length > 0
      ? { aspectTemplates: hub?.template.aspectTemplates }
      : { aspectTemplates: globalAspectTemplates || [] };
  const isPrivate = !Boolean(hub?.authorization?.anonymousReadAccess ?? true);
  const error = configError || hubError;

  const contextPrivileges = hub?.context?.authorization?.myPrivileges ?? [];
  const hubPrivileges = hub?.authorization?.myPrivileges ?? [];

  const isMember = user?.ofHub(hubId) ?? false;
  const isGlobalAdmin = user?.isGlobalAdmin ?? false;
  const canReadChallenges = isPrivate ? isMember || isGlobalAdmin : true;

  const communityReadAccess = (hub?.community?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const permissions = useMemo<HubPermissions>(
    () => ({
      viewerCanUpdate: hubPrivileges.includes(AuthorizationPrivilege.Update),
      canReadChallenges,
      communityReadAccess,
      canReadAspects: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    }),
    [hubPrivileges, contextPrivileges, canReadChallenges]
  );

  return (
    <HubContext.Provider
      value={{
        hub,
        hubId,
        hubNameId,
        communityId,
        visuals,
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
