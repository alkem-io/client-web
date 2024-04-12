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
  spaceId: string;
  skip?: boolean;
}

interface UseSpaceDashboardNavigationProvided {
  dashboardNavigation: DashboardNavigationItem[] | undefined;
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
  children?: DashboardNavigationItem[];
}

const getDashboardNavigationItemProps = (
  journey: {
    id: string;
    profile: SpaceDashboardNavigationProfileFragment;
    community?: SpaceDashboardNavigationCommunityFragment;
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
  };
};

const isReadable = ({ authorization }: { authorization?: Partial<Authorization> }) =>
  authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

const useSpaceDashboardNavigation = ({
  spaceId,
  skip,
}: UseSpaceDashboardNavigationProps): UseSpaceDashboardNavigationProvided => {
  const { data: challengesQueryData, loading: challengesQueryLoading } = useSpaceDashboardNavigationChallengesQuery({
    variables: { spaceId },
    skip,
  });

  const challenges = challengesQueryData?.space.subspaces;

  const readableChallengeIds = challenges?.filter(isReadable).map(({ id }) => id);

  const { data: opportunitiesQueryData, loading: opportunitiesQueryLoading } =
    useSpaceDashboardNavigationOpportunitiesQuery({
      variables: {
        spaceId,
        challengeIds: readableChallengeIds!,
      },
      skip: !readableChallengeIds || skip,
    });

  const challengesWithOpportunitiesById = useMemo(
    () => keyBy(opportunitiesQueryData?.space.subspaces, 'id'),
    [opportunitiesQueryData]
  );

  const loading = challengesQueryLoading || opportunitiesQueryLoading;

  const dashboardNavigation = useMemo(
    () =>
      challenges?.map(challenge => {
        const opportunities = challengesWithOpportunitiesById[challenge.id]?.subspaces ?? [];

        return {
          ...getDashboardNavigationItemProps(challenge, !isReadable(challenge)),
          children: opportunities.map(opportunity => getDashboardNavigationItemProps(opportunity)),
        };
      }),
    [challengesQueryData, opportunitiesQueryData]
  );

  return {
    dashboardNavigation,
    loading,
  };
};

export default useSpaceDashboardNavigation;
