import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useSpaceProviderQuery, useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpaceInfoFragment,
  SpacePrivacyMode,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user';

export interface SpacePermissions {
  canRead: boolean;
  viewerCanUpdate: boolean;
  canReadPosts: boolean;
  canReadSubspaces: boolean;
  canCreateSubspaces: boolean;
  canCreateTemplates: boolean;
  canCreate: boolean;
  communityReadAccess: boolean;
  canReadCollaboration: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface SpaceContextProps {
  spaceId: string;
  spaceNameId: string;
  communityId: string;
  collaborationId: string;
  calloutsSetId: string;
  roleSetId: string;
  isPrivate?: boolean;
  loading: boolean;
  permissions: SpacePermissions;
  error?: ApolloError;
  refetchSpace: () => void;
  // TODO Some components just randomly access SpaceContext instead of just querying the data the usual way.
  // TODO This Context should provide as little data as possible or just be removed.
  context?: SpaceInfoFragment['context'];
  profile: SpaceInfoFragment['profile'];
  visibility: SpaceVisibility;
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

const SpaceContext = React.createContext<SpaceContextProps>({
  loading: false,
  isPrivate: undefined,
  spaceId: '',
  spaceNameId: '',
  communityId: '',
  collaborationId: '',
  calloutsSetId: '',
  roleSetId: '',
  permissions: {
    canRead: false,
    viewerCanUpdate: false,
    canCreate: false,
    canCreateSubspaces: false,
    canCreateTemplates: false,
    canReadPosts: false,
    canReadSubspaces: false,
    communityReadAccess: false,
    canReadCollaboration: false,
    contextPrivileges: [],
  },
  profile: {
    id: '',
    displayName: '',
    visuals: [],
    tagline: '',
    url: '',
  },
  visibility: SpaceVisibility.Active,
  refetchSpace: () => {},
  myMembershipStatus: undefined,
});

interface SpaceProviderProps {}

const NO_PRIVILEGES = [];

const SpaceContextProvider: FC<SpaceProviderProps> = ({ children }) => {
  const { spaceNameId = '' } = useUrlParams();

  const { isAuthenticated } = useUserContext();

  const {
    data,
    loading,
    refetch: refetchSpace,
  } = useSpaceProviderQuery({
    variables: { spaceNameId },
    errorPolicy: 'all',
    skip: !spaceNameId,
  });

  const space = data?.space;
  const spaceId = space?.id || '';
  const visibility = space?.visibility || SpaceVisibility.Active;

  const communityId = space?.community?.id ?? '';
  const collaborationId = space?.collaboration?.id ?? '';
  const calloutsSetId = space?.collaboration?.calloutsSet?.id ?? '';
  const roleSetId = space?.community?.roleSet?.id ?? '';
  console.log('@@@ roleSetId >>>', roleSetId);
  const isPrivate = space && space.settings.privacy?.mode === SpacePrivacyMode.Private;

  const contextPrivileges = space?.context?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const spacePrivileges = space?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const collaborationPrivileges = space?.collaboration?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const canReadSubspaces = spacePrivileges.includes(AuthorizationPrivilege.Read);
  const canCreateSubspaces = spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace);

  // A member has READ and an Admin can also access it, this is more of a temporary solution
  const canAccessTemplatesManager =
    space?.community.roleSet.myMembershipStatus === CommunityMembershipStatus.Member ||
    spacePrivileges.includes(AuthorizationPrivilege.Grant);
  let canCreateTemplates = false;

  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceNameId },
    skip: !spaceNameId || !canAccessTemplatesManager,
  });

  if (canAccessTemplatesManager) {
    canCreateTemplates =
      templatesManagerData?.space.templatesManager?.templatesSet?.authorization?.myPrivileges?.includes(
        AuthorizationPrivilege.Create
      ) ?? false;
  }

  const canCreate = spacePrivileges.includes(AuthorizationPrivilege.Create);
  const communityPrivileges = space?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = useMemo<SpacePermissions>(() => {
    return {
      canRead: spacePrivileges.includes(AuthorizationPrivilege.Read),
      viewerCanUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canReadSubspaces,
      canCreateSubspaces: canCreateSubspaces,
      canCreateTemplates,
      canCreate,
      communityReadAccess: isAuthenticated && communityPrivileges.includes(AuthorizationPrivilege.Read),
      canReadCollaboration: collaborationPrivileges.includes(AuthorizationPrivilege.Read),
      canReadPosts: contextPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges,
    };
  }, [
    spacePrivileges,
    canReadSubspaces,
    canCreateSubspaces,
    canCreateTemplates,
    canCreate,
    communityPrivileges,
    collaborationPrivileges,
    contextPrivileges,
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
      url: space?.profile.url ?? '',
      visibility,
    };
  }, [space?.profile]);

  return (
    <SpaceContext.Provider
      value={{
        spaceId,
        spaceNameId,
        communityId,
        collaborationId,
        calloutsSetId,
        roleSetId,
        permissions,
        isPrivate,
        loading,
        refetchSpace,
        profile,
        context: space?.context,
        visibility,
        myMembershipStatus: space?.community?.roleSet?.myMembershipStatus,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export { SpaceContextProvider, SpaceContext };
