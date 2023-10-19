import {
  useSpaceDashboardNavigationChallengesQuery,
  useSpaceDashboardNavigationOpportunitiesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../JourneyTypeName';
import {
  Authorization,
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpaceDashboardNavigationCommunityFragment,
  SpaceDashboardNavigationContextFragment,
  SpaceDashboardNavigationLifecycleFragment,
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
  journeyTypeName: JourneyTypeName;
  visual?: {
    uri: string;
    alternativeText?: string;
  };
  tags: string[] | undefined;
  lifecycleState: string | undefined;
  private?: boolean;
  member: boolean;
  children?: DashboardNavigationItem[];
}

const DashboardNavigationItemPropsGetter =
  (journeyTypeName: JourneyTypeName) =>
  (
    journey: {
      id: string;
      nameID: string;
      profile: SpaceDashboardNavigationProfileFragment;
      context?: SpaceDashboardNavigationContextFragment;
      lifecycle?: SpaceDashboardNavigationLifecycleFragment;
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
      visual: journey.profile.visual,
      tags: journey.profile.tagset?.tags,
      lifecycleState: journey.lifecycle?.state,
      private: disabled,
      member: journey.community?.myMembershipStatus === CommunityMembershipStatus.Member,
      journeyTypeName,
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

  const challengeToItem = DashboardNavigationItemPropsGetter('challenge');
  const opportunityToItem = DashboardNavigationItemPropsGetter('opportunity');

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
          ...challengeToItem(challenge, !isReadable(challenge)),
          children: opportunities.map(opportunity => opportunityToItem(opportunity)),
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
