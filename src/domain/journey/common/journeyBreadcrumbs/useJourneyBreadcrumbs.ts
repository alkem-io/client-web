import { useMemo } from 'react';
import {
  useJourneyBreadcrumbsChallengeQuery,
  useJourneyBreadcrumbsOpportunityQuery,
  useJourneyBreadcrumbsSpaceQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface BreadcrumbsItem {
  displayName: string;
  uri: string;
  journeyTypeName: JourneyTypeName;
  avatar?: {
    uri?: string;
  };
}

const JOURNEY_NESTING: JourneyTypeName[] = ['space', 'challenge', 'opportunity'];

export const useJourneyBreadcrumbs = () => {
  const {
    spaceId,
    subSpaceId: challengeId,
    subSubSpaceId: opportunityId,
    journeyTypeName,
    loading,
  } = useRouteResolver();

  const currentJourneyIndex = journeyTypeName && JOURNEY_NESTING.indexOf(journeyTypeName);

  const shouldFetchJourney = (journey: JourneyTypeName) => {
    if (!journeyTypeName) {
      return false;
    }
    const targetJourneyIndex = JOURNEY_NESTING.indexOf(journey);
    return targetJourneyIndex <= currentJourneyIndex!;
  };

  const { data: _space, loading: isLoadingSpace } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !shouldFetchJourney('space') || loading,
  });

  const { data: _challenge, loading: isLoadingChallenge } = useJourneyBreadcrumbsChallengeQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: !shouldFetchJourney('challenge') || loading,
  });

  const { data: _opportunity, loading: isLoadingOpportunity } = useJourneyBreadcrumbsOpportunityQuery({
    variables: {
      opportunityId: opportunityId!,
    },
    skip: !shouldFetchJourney('opportunity') || loading,
  });

  const getJourneyProfile = (journey: JourneyTypeName) => {
    switch (journey) {
      case 'space':
        return _space?.space.profile;
      case 'challenge':
        return _challenge?.lookup.subspace?.profile;
      case 'opportunity':
        return _opportunity?.lookup.opportunity?.profile;
    }
  };

  const isLoading = isLoadingSpace || isLoadingChallenge || isLoadingOpportunity;

  const breadcrumbs = useMemo<BreadcrumbsItem[]>(() => {
    if (isLoading || !journeyTypeName) {
      return [];
    }

    return JOURNEY_NESTING.slice(0, currentJourneyIndex! + 1).map(journey => {
      const profile = getJourneyProfile(journey);
      const displayName = profile?.displayName!;
      const journeyUri = profile?.url!;
      return {
        displayName,
        uri: journeyUri,
        journeyTypeName: journey,
        avatar: profile?.avatar,
      };
    });
  }, [isLoading, journeyTypeName, _challenge, _space, _opportunity]);

  return {
    loading: isLoading,
    breadcrumbs,
  };
};
