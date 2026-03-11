import { useCallback, useMemo } from 'react';
import {
  useSpaceDashboardNavigationSubspacesQuery,
  useSpacePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  type MyMembershipsRoleSetFragment,
  SpaceSortMode,
} from '@/core/apollo/generated/graphql-schema';
import { sortBySortOrder } from '@/core/utils/sortBySortOrder';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

interface UseSpaceDashboardNavigationProps {
  spaceId: string | undefined;
  skip?: boolean;
}

interface UseSpaceDashboardNavigationProvided {
  dashboardNavigation: DashboardNavigationItem | undefined;
  loading: boolean;
  refetch: () => void;
}

export interface DashboardNavigationItem {
  id: string;
  displayName: string;
  url: string;
  avatar?: {
    uri: string;
    alternativeText?: string;
  };
  innovationFlowState?: string | undefined;
  private?: boolean;
  pinned?: boolean;
  member: boolean;
  canCreateSubspace?: boolean;
  children?: DashboardNavigationItem[];
}

const getDashboardNavigationItemProps = (space: {
  id: string;
  about: SpaceAboutLightModel;
  roleSet?: MyMembershipsRoleSetFragment;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}): DashboardNavigationItem => {
  return {
    id: space.id,
    url: space.about.profile.url,
    displayName: space.about.profile.displayName,
    avatar: space.about.profile.avatar,
    private: !space.about.isContentPublic,
    member: space.about.membership?.myMembershipStatus === CommunityMembershipStatus.Member,
    canCreateSubspace: space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateSubspace),
  };
};

const useSpaceDashboardNavigation = ({
  spaceId,
  skip,
}: UseSpaceDashboardNavigationProps): UseSpaceDashboardNavigationProvided => {
  // TODO: Additional Auth Check
  const { data: subSpacesAuth, loading: subSpacesAuthLoading } = useSpacePrivilegesQuery({
    variables: { spaceId: spaceId! },
    skip: skip || !spaceId,
  });

  const hasSpaceProfileReadAccess = subSpacesAuth?.lookup.space?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Read
  );

  const {
    data: subSpacesQueryData,
    loading: subSpacesQueryLoading,
    refetch: refetchSubSpaces,
  } = useSpaceDashboardNavigationSubspacesQuery({
    variables: { spaceId: spaceId! },
    skip: skip || !spaceId || subSpacesAuthLoading || !hasSpaceProfileReadAccess,
  });

  const space = subSpacesQueryData?.lookup.space;

  const loading = subSpacesQueryLoading;

  const dashboardNavigation = useMemo<DashboardNavigationItem | undefined>(() => {
    if (!space) {
      return undefined;
    }

    const sortMode = space.settings?.sortMode;
    let sortedSubspaces = [...space.subspaces];

    if (sortMode === SpaceSortMode.Custom) {
      sortedSubspaces.sort(sortBySortOrder);
    } else {
      // Alphabetical: pinned first (by sortOrder), then non-pinned (by displayName A-Z)
      const pinned = sortedSubspaces.filter(s => s.pinned).sort(sortBySortOrder);
      const unpinned = sortedSubspaces
        .filter(s => !s.pinned)
        .sort((a, b) => a.about.profile.displayName.localeCompare(b.about.profile.displayName));
      sortedSubspaces = [...pinned, ...unpinned];
    }

    const isAlphabetical = sortMode !== SpaceSortMode.Custom;

    return {
      ...getDashboardNavigationItemProps(space),
      children: sortedSubspaces.map(subspace => ({
        ...getDashboardNavigationItemProps(subspace),
        pinned: isAlphabetical && subspace.pinned,
      })),
    };
  }, [subSpacesQueryData]);

  const refetch = useCallback(() => {
    refetchSubSpaces();
  }, [refetchSubSpaces]);

  return {
    dashboardNavigation,
    loading,
    refetch,
  };
};

export default useSpaceDashboardNavigation;
