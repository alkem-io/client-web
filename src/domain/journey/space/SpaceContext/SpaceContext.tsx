import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useConfig } from '../../../platform/config/useConfig';
import { useSpaceProviderQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  License,
  SpaceInfoFragment,
  SpaceVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import { useUserContext } from '../../../community/user';

export interface SpacePermissions {
  canRead: boolean;
  viewerCanUpdate: boolean;
  canReadPosts: boolean;
  canReadChallenges: boolean;
  canCreateChallenges: boolean;
  canCreate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
  collaborationPrivileges: AuthorizationPrivilege[];
}

interface SpaceContextProps {
  spaceId: string;
  spaceNameId: string;
  collaborationId: string;
  communityId: string;
  isPrivate?: boolean;
  loading: boolean;
  permissions: SpacePermissions;
  error?: ApolloError;
  refetchSpace: () => void;
  // TODO Some components just randomly access SpaceContext instead of just querying the data the usual way.
  // TODO This Context should provide as little data as possible or just be removed.
  context?: SpaceInfoFragment['context'];
  profile: SpaceInfoFragment['profile'];
  license: License;
}

const SpaceContext = React.createContext<SpaceContextProps>({
  loading: false,
  isPrivate: undefined,
  spaceId: '',
  spaceNameId: '',
  collaborationId: '',
  communityId: '',
  permissions: {
    canRead: false,
    viewerCanUpdate: false,
    canCreate: false,
    canCreateChallenges: false,
    canReadPosts: false,
    canReadChallenges: false,
    communityReadAccess: false,
    contextPrivileges: [],
    collaborationPrivileges: [],
  },
  profile: {
    id: '',
    displayName: '',
    visuals: [],
    tagline: '',
  },
  license: {
    id: '',
    visibility: SpaceVisibility.Active,
    featureFlags: [],
  },
  refetchSpace: () => {},
});

interface SpaceProviderProps {}

const NO_PRIVILEGES = [];

const SpaceContextProvider: FC<SpaceProviderProps> = ({ children }) => {
  const { spaceNameId = '' } = useUrlParams();
  // todo: still needed?
  const { error: configError } = useConfig();
  const { isAuthenticated } = useUserContext();

  const {
    error: spaceError,
    data,
    loading,
    refetch: refetchSpace,
  } = useSpaceProviderQuery({
    variables: { spaceId: spaceNameId, includeCollaboration: isAuthenticated },
    errorPolicy: 'all',
    skip: !spaceNameId,
  });

  const space = data?.space;
  const spaceId = space?.id || '';
  const license = {
    id: space?.license.id || '',
    visibility: space?.license?.visibility || SpaceVisibility.Active,
    featureFlags: [],
  };
  const collaborationId = space?.collaboration?.id ?? '';
  const communityId = space?.community?.id ?? '';
  const isPrivate = space && !space.authorization?.anonymousReadAccess;
  const error = configError || spaceError;

  const contextPrivileges = space?.context?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const spacePrivileges = space?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const canReadChallenges = spacePrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateChallenges = spacePrivileges.includes(AuthorizationPrivilege.CreateChallenge);
  const canCreate = spacePrivileges.includes(AuthorizationPrivilege.Create);

  const collaborationPrivileges = space?.collaboration?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const communityPrivileges = space?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = useMemo<SpacePermissions>(() => {
    return {
      canRead: spacePrivileges.includes(AuthorizationPrivilege.Read),
      viewerCanUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canReadChallenges,
      canCreateChallenges,
      canCreate,
      communityReadAccess: communityPrivileges.includes(AuthorizationPrivilege.Read),
      canReadPosts: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
      collaborationPrivileges,
    };
  }, [
    spacePrivileges,
    contextPrivileges,
    canReadChallenges,
    communityPrivileges,
    collaborationPrivileges,
    canCreate,
    canCreateChallenges,
  ]);

  const profile = useMemo(() => {
    return {
      id: space?.profile.id ?? '',
      displayName: space?.profile.displayName || '',
      description: space?.profile.description,
      tagset: space?.profile.tagset,
      visuals: space?.profile.visuals ?? [],
      tagline: space?.profile.tagline || '',
      references: space?.profile.references ?? [],
      location: space?.profile.location,
      license,
    };
  }, [space?.profile]);

  return (
    <SpaceContext.Provider
      value={{
        spaceId,
        spaceNameId,
        collaborationId,
        communityId,
        permissions,
        isPrivate,
        loading,
        error,
        refetchSpace,
        profile,
        context: space?.context,
        license,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export { SpaceContextProvider, SpaceContext };
