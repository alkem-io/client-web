import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useConfig } from '../../../platform/config/useConfig';
import { useHubProviderQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  HubInfoFragment,
  HubVisibility,
} from '../../../../core/apollo/generated/graphql-schema';

export interface HubPermissions {
  viewerCanUpdate: boolean;
  canReadAspects: boolean;
  canReadChallenges: boolean;
  canCreateChallenges: boolean;
  canCreate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface HubContextProps {
  hubId: string;
  hubNameId: string;
  communityId: string;
  isPrivate?: boolean;
  loading: boolean;
  permissions: HubPermissions;
  error?: ApolloError;
  refetchHub: () => void;
  // TODO Some components just randomly access HubContext instead of just querying the data the usual way.
  // TODO This Context should provide as little data as possible or just be removed.
  hostId?: string;
  context?: HubInfoFragment['context'];
  profile: HubInfoFragment['profile'];
  visibility: HubVisibility;
}

const HubContext = React.createContext<HubContextProps>({
  loading: false,
  isPrivate: undefined,
  hubId: '',
  hubNameId: '',
  communityId: '',
  permissions: {
    viewerCanUpdate: false,
    canCreate: false,
    canCreateChallenges: false,
    canReadAspects: false,
    canReadChallenges: false,
    communityReadAccess: false,
    contextPrivileges: [],
  },
  profile: {
    id: '',
    displayName: '',
    visuals: [],
  },
  visibility: HubVisibility.Active,
  refetchHub: () => {},
});

interface HubProviderProps {}

const NO_PRIVILEGES = [];

const HubContextProvider: FC<HubProviderProps> = ({ children }) => {
  const { hubNameId = '' } = useUrlParams();
  // todo: still needed?
  const { error: configError } = useConfig();

  const {
    error: hubError,
    data,
    loading,
    refetch: refetchHub,
  } = useHubProviderQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
    skip: !hubNameId,
  });

  const hub = data?.hub;
  const hubId = hub?.id || '';
  const visibility = hub?.visibility || HubVisibility.Active;
  const displayName = hub?.profile.displayName || '';
  const communityId = hub?.community?.id ?? '';
  const visuals = hub?.profile.visuals ?? [];
  const isPrivate = hub && !hub.authorization?.anonymousReadAccess;
  const error = configError || hubError;

  const contextPrivileges = hub?.context?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const hubPrivileges = hub?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const canReadChallenges = hubPrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateChallenges = hubPrivileges.includes(AuthorizationPrivilege.CreateChallenge);
  const canCreate = hubPrivileges.includes(AuthorizationPrivilege.Create);

  const communityPrivileges = hub?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = useMemo<HubPermissions>(() => {
    return {
      viewerCanUpdate: hubPrivileges.includes(AuthorizationPrivilege.Update),
      canReadChallenges,
      canCreateChallenges,
      canCreate,
      communityReadAccess: communityPrivileges.includes(AuthorizationPrivilege.Read),
      canReadAspects: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    };
  }, [hubPrivileges, contextPrivileges, canReadChallenges, communityPrivileges, canCreate, canCreateChallenges]);

  return (
    <HubContext.Provider
      value={{
        hubId,
        hubNameId,
        communityId,
        permissions,
        isPrivate,
        loading,
        error,
        refetchHub,
        profile: {
          id: hub?.profile.id ?? '',
          displayName,
          tagset: hub?.profile.tagset,
          visuals,
        },
        hostId: hub?.host?.id,
        context: hub?.context,
        visibility,
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export { HubContextProvider, HubContext };
