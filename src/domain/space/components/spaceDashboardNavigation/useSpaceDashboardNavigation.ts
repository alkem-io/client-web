import {
  useSpaceDashboardNavigationSubspacesQuery,
  useSpacePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  MyMembershipsRoleSetFragment,
} from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { useCallback, useMemo } from 'react';

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
    return {
      ...getDashboardNavigationItemProps(space),
      children: space.subspaces.map(subspace => {
        return {
          ...getDashboardNavigationItemProps(subspace),
        };
      }),
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
