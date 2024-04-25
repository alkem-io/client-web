import {
  useSpaceDashboardNavigationChallengesQuery,
  useSpaceDashboardNavigationOpportunitiesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  Authorization,
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpaceDashboardNavigationCommunityFragment,
  SpaceDashboardNavigationProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { keyBy } from 'lodash';
import { useMemo } from 'react';

interface UseSpaceDashboardNavigationProps {
  spaceId: string | undefined;
  skip?: boolean;
}

interface UseSpaceDashboardNavigationProvided {
  dashboardNavigation: DashboardNavigationItem | undefined;
  loading: boolean;
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
  journey: {
    id: string;
    profile: SpaceDashboardNavigationProfileFragment;
    community?: SpaceDashboardNavigationCommunityFragment;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
  },
  disabled?: boolean
): DashboardNavigationItem => {
  return {
    id: journey.id,
    url: journey.profile.url,
    displayName: journey.profile.displayName,
    avatar: journey.profile.avatar,
    private: disabled,
    member: journey.community?.myMembershipStatus === CommunityMembershipStatus.Member,
    canCreateSubspace: journey.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateSubspace),
  };
};

const isReadable = ({ authorization }: { authorization?: Partial<Authorization> }) =>
  authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

const useSpaceDashboardNavigation = ({
  spaceId,
  skip,
}: UseSpaceDashboardNavigationProps): UseSpaceDashboardNavigationProvided => {
  const { data: challengesQueryData, loading: challengesQueryLoading } = useSpaceDashboardNavigationChallengesQuery({
    variables: { spaceId: spaceId! },
    skip: skip || !spaceId,
  });

  const space = challengesQueryData?.space;

  const readableChallengeIds = space?.subspaces.filter(isReadable).map(({ id }) => id);

  const { data: opportunitiesQueryData, loading: opportunitiesQueryLoading } =
    useSpaceDashboardNavigationOpportunitiesQuery({
      variables: {
        spaceId: spaceId!,
        challengeIds: readableChallengeIds!,
      },
      skip: !readableChallengeIds || skip,
    });

  const challengesWithOpportunitiesById = useMemo(
    () => keyBy(opportunitiesQueryData?.space.subspaces, 'id'),
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

  return {
    dashboardNavigation,
    loading,
  };
};

export default useSpaceDashboardNavigation;
