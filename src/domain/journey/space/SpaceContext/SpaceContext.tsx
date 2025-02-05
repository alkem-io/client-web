import React, { FC, useMemo } from 'react';
import {
  useSpaceCommunityIdsQuery,
  useSpaceQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpacePrivacyMode,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export interface SpacePermissions {
  canRead: boolean;
  canUpdate: boolean;
  canReadSubspaces: boolean;
  canCreateSubspaces: boolean;
  canCreateTemplates: boolean;
  canReadCommunity: boolean;
  canReadCollaboration: boolean;
}

interface SpaceContextProps {
  /**
   * This is the level 0 space id, not neccessarily the the current space
   */
  spaceId: string;
  spaceNameId: string; // This is the level 0 nameId, not neccessarily the the current space, it's used for search
  communityId: string;
  collaborationId: string;
  calloutsSetId: string;
  roleSetId: string;
  isPrivate?: boolean;
  permissions: SpacePermissions;
  profile: {
    displayName: string;
    url: string;
  };
  visibility: SpaceVisibility;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  loading: boolean;
}

const SpaceContext = React.createContext<SpaceContextProps>({
  spaceId: '',
  spaceNameId: '',
  communityId: '',
  collaborationId: '',
  calloutsSetId: '',
  roleSetId: '',
  isPrivate: undefined,
  profile: {
    displayName: '',
    url: '',
  },
  permissions: {
    canRead: false,
    canUpdate: false,
    canCreateSubspaces: false,
    canCreateTemplates: false,
    canReadSubspaces: false,
    canReadCommunity: false,
    canReadCollaboration: false,
  },
  visibility: SpaceVisibility.Active,
  myMembershipStatus: undefined,
  loading: false,
});

interface SpaceProviderProps {}

const NO_PRIVILEGES = [];

const SpaceContextProvider: FC<SpaceProviderProps> = ({ children }) => {
  const { isAuthenticated } = useUserContext();
  const { levelZeroSpaceId } = useUrlResolver();
  const spaceId = levelZeroSpaceId ?? '';

  const { data, loading: loadingSpaceQuery } = useSpaceQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const space = data?.lookup.space;
  const spaceNameId = space?.nameID ?? '';
  const visibility = space?.visibility || SpaceVisibility.Active;

  const { data: communityData, loading: communityLoading } = useSpaceCommunityIdsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId || !isAuthenticated,
  });

  const communityId = communityData?.lookup.space?.community?.id ?? '';
  const collaborationId = space?.collaboration?.id ?? '';
  const calloutsSetId = space?.collaboration?.calloutsSet?.id ?? '';
  const roleSetId = communityData?.lookup.space?.community?.roleSet?.id ?? '';
  const isPrivate = space && space.settings.privacy?.mode === SpacePrivacyMode.Private;

  const spacePrivileges = space?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const collaborationPrivileges = space?.collaboration?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  // A member has READ and an Admin can also access it, this is more of a temporary solution
  const canAccessTemplatesManager =
    communityData?.lookup.space?.community?.roleSet.myMembershipStatus === CommunityMembershipStatus.Member ||
    spacePrivileges.includes(AuthorizationPrivilege.Grant);

  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId || !canAccessTemplatesManager,
  });
  const canCreateTemplates =
    (canAccessTemplatesManager &&
      templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.authorization?.myPrivileges?.includes(
        AuthorizationPrivilege.Create
      )) ??
    false;

  const communityPrivileges = communityData?.lookup.space?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const myMembershipStatus = communityData?.lookup.space?.community?.roleSet?.myMembershipStatus;

  const permissions = useMemo<SpacePermissions>(() => {
    return {
      canRead: spacePrivileges.includes(AuthorizationPrivilege.Read),
      canUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canCreateSubspaces: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      canReadSubspaces: spacePrivileges.includes(AuthorizationPrivilege.Read), //!! ??
      canCreateTemplates,
      canReadCommunity: isAuthenticated && communityPrivileges.includes(AuthorizationPrivilege.Read),
      canReadCollaboration: collaborationPrivileges.includes(AuthorizationPrivilege.Read),
    };
  }, [spacePrivileges, canCreateTemplates, communityPrivileges, collaborationPrivileges]);

  const profile = useMemo(() => {
    return {
      displayName: space?.profile.displayName ?? '',
      url: space?.profile.url ?? '',
    };
  }, [space?.profile]);

  const loading = loadingSpaceQuery || communityLoading;
  return (
    <SpaceContext.Provider
      value={{
        spaceId,
        spaceNameId,
        profile,
        communityId,
        collaborationId,
        calloutsSetId,
        roleSetId,
        permissions,
        isPrivate,
        loading,
        visibility,
        myMembershipStatus,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export { SpaceContextProvider, SpaceContext };
