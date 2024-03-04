import {
  useSpaceDashboardNavigationChallengesQuery,
  useSpaceDashboardNavigationOpportunitiesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import {
  Authorization,
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpaceDashboardNavigationCommunityFragment,
  SpaceDashboardNavigationContextFragment,
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
  nameId: string;
  displayName: string;
  tagline: string;
  vision?: string;
  avatar?: {
    uri: string;
    alternativeText?: string;
  };
  cardBanner?: {
    uri: string;
    alternativeText?: string;
  };
  tags: string[] | undefined;
  innovationFlowState: string | undefined;
  private?: boolean;
  member: boolean;
  children?: DashboardNavigationItem[];
}

const getDashboardNavigationItemProps = (
  journey: {
    id: string;
    nameID: string;
    profile: SpaceDashboardNavigationProfileFragment;
    context?: SpaceDashboardNavigationContextFragment;
    community?: SpaceDashboardNavigationCommunityFragment;
  },
  disabled?: boolean
): DashboardNavigationItem => {
  return {
    id: journey.id,
    nameId: journey.nameID,
    displayName: journey.profile.displayName,
    tagline: journey.profile.tagline,
    vision: journey.context?.vision,
    avatar: journey.profile.avatar,
    cardBanner: journey.profile.cardBanner,
    tags: journey.profile.tagset?.tags,
    innovationFlowState: '', //!! journey.lifecycle?.state, // TODO
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

  const challenges = challengesQueryData?.space.challenges;

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
    () => keyBy(opportunitiesQueryData?.space.challenges, 'id'),
    [opportunitiesQueryData]
  );

  const loading = challengesQueryLoading || opportunitiesQueryLoading;

  const dashboardNavigation = useMemo(
    () =>
      challenges?.map(challenge => {
        const opportunities = challengesWithOpportunitiesById[challenge.id]?.opportunities ?? [];

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
