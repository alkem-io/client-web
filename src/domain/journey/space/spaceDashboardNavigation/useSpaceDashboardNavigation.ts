import {
  useSpaceDashboardNavigationOpportunitiesQuery,
  useSpaceDashboardNavigationSubspacesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  Authorization,
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  MyMembershipsRoleSetFragment,
  SpaceDashboardNavigationProfileFragment,
} from '@/core/apollo/generated/graphql-schema';
import { keyBy } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';

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

const getDashboardNavigationItemProps = (
  space: {
    id: string;
    about: {
      profile: SpaceDashboardNavigationProfileFragment;
    };
    roleSet?: MyMembershipsRoleSetFragment;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
  },
  disabled?: boolean
): DashboardNavigationItem => {
  return {
    id: space.id,
    url: space.about.profile.url,
    displayName: space.about.profile.displayName,
    avatar: space.about.profile.avatar,
    private: disabled,
    member: space.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member,
    canCreateSubspace: space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateSubspace),
  };
};

const isReadable = ({ authorization }: { authorization?: Partial<Authorization> }) =>
  authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

const useSpaceDashboardNavigation = ({
  spaceId,
  skip,
}: UseSpaceDashboardNavigationProps): UseSpaceDashboardNavigationProvided => {
  const {
    data: challengesQueryData,
    loading: challengesQueryLoading,
    refetch: refetchChallenges,
  } = useSpaceDashboardNavigationSubspacesQuery({
    variables: { spaceId: spaceId! },
    skip: skip || !spaceId,
  });

  const space = challengesQueryData?.lookup.space;

  const readableChallengeIds = space?.subspaces.filter(isReadable).map(({ id }) => id) ?? [];

  const {
    data: opportunitiesQueryData,
    loading: opportunitiesQueryLoading,
    refetch: refetchOpportunities,
  } = useSpaceDashboardNavigationOpportunitiesQuery({
    variables: {
      spaceId: spaceId!,
      challengeIds: readableChallengeIds!,
    },
    skip: !readableChallengeIds.length || skip,
  });

  useEffect(() => {
    if (readableChallengeIds.length > 0) {
      refetchOpportunities();
    }
  }, [readableChallengeIds.join(',')]);

  const challengesWithOpportunitiesById = useMemo(
    () => keyBy(opportunitiesQueryData?.lookup.space?.subspaces, 'id'),
    [opportunitiesQueryData]
  );

  const loading = challengesQueryLoading || opportunitiesQueryLoading;

  const dashboardNavigation = useMemo<DashboardNavigationItem | undefined>(() => {
    if (!space) {
      return undefined;
    }
    return {
      ...getDashboardNavigationItemProps(space),
      children: space.subspaces.map(subspace => {
        const subspaces = challengesWithOpportunitiesById[subspace.id]?.subspaces ?? [];

        return {
          ...getDashboardNavigationItemProps(subspace, !isReadable(subspace)),
          children: subspaces.map(challenge => getDashboardNavigationItemProps(challenge, !isReadable(challenge))),
        };
      }),
    };
  }, [challengesQueryData, opportunitiesQueryData]);

  const refetch = useCallback(() => {
    refetchChallenges();
    refetchOpportunities();
  }, [refetchChallenges, refetchOpportunities]);

  return {
    dashboardNavigation,
    loading,
    refetch,
  };
};

export default useSpaceDashboardNavigation;
