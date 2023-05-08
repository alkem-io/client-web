import {
  useHubDashboardNavigationChallengesQuery,
  useHubDashboardNavigationOpportunitiesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../JourneyTypeName';
import {
  Authorization,
  AuthorizationPrivilege,
  HubDashboardNavigationItemFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { keyBy } from 'lodash';
import { useMemo } from 'react';

interface UseHubDashboardNavigationProps {
  hubId: string;
}

interface UseHubDashboardNavigationProvided {
  dashboardNavigation: DashboardNavigationItem[] | undefined;
  loading: boolean;
}

export interface DashboardNavigationItem {
  id: string;
  nameId: string;
  displayName: string;
  journeyTypeName: JourneyTypeName;
  visualUri: string | undefined;
  private?: boolean;
  children?: DashboardNavigationItem[];
}

const DashboardNavigationItemPropsGetter =
  (journeyTypeName: JourneyTypeName) =>
  (
    journey: { id: string; nameID: string; profile: HubDashboardNavigationItemFragment },
    disabled?: boolean
  ): DashboardNavigationItem => {
    return {
      id: journey.id,
      nameId: journey.nameID,
      displayName: journey.profile.displayName,
      visualUri: journey.profile.visual?.uri,
      private: disabled,
      journeyTypeName,
    };
  };

const isReadable = ({ authorization }: { authorization?: Partial<Authorization> }) =>
  authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

const useHubDashboardNavigation = ({ hubId }: UseHubDashboardNavigationProps): UseHubDashboardNavigationProvided => {
  const { data: challengesQueryData, loading: challengesQueryLoading } = useHubDashboardNavigationChallengesQuery({
    variables: { hubId },
  });

  const challenges = challengesQueryData?.hub.challenges;

  const readableChallengeIds = challenges?.filter(isReadable).map(({ id }) => id);

  const { data: opportunitiesQueryData, loading: opportunitiesQueryLoading } =
    useHubDashboardNavigationOpportunitiesQuery({
      variables: {
        hubId,
        challengeIds: readableChallengeIds!,
      },
      skip: !readableChallengeIds,
    });

  const challengeToItem = DashboardNavigationItemPropsGetter('challenge');
  const opportunityToItem = DashboardNavigationItemPropsGetter('opportunity');

  const challengesWithOpportunitiesById = useMemo(
    () => keyBy(opportunitiesQueryData?.hub.challenges, 'id'),
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

export default useHubDashboardNavigation;
