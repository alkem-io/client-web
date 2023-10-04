import { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildJourneyUrlByJourneyTypeName } from '../../../../main/routing/urlBuilders';
import {
  useJourneyBreadcrumbsChallengeQuery,
  useJourneyBreadcrumbsOpportunityQuery,
  useJourneyBreadcrumbsSpaceQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { getRawJourneyTypeName, JourneyTypeName } from '../../JourneyTypeName';

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
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const journeyTypeName = getRawJourneyTypeName({ spaceNameId, challengeNameId, opportunityNameId });

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
      spaceNameId: spaceNameId!,
    },
    skip: !shouldFetchJourney('space'),
  });

  const { data: _challenge, loading: isLoadingChallenge } = useJourneyBreadcrumbsChallengeQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: challengeNameId!,
    },
    skip: !shouldFetchJourney('challenge'),
  });

  const { data: _opportunity, loading: isLoadingOpportunity } = useJourneyBreadcrumbsOpportunityQuery({
    variables: {
      spaceNameId: spaceNameId!,
      opportunityNameId: opportunityNameId!,
    },
    skip: !shouldFetchJourney('opportunity'),
  });

  const getJourneyProfile = (journey: JourneyTypeName) => {
    switch (journey) {
      case 'space':
        return _space?.space.profile;
      case 'challenge':
        return _challenge?.space.challenge.profile;
      case 'opportunity':
        return _opportunity?.space.opportunity.profile;
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
      const journeyUri = buildJourneyUrlByJourneyTypeName(
        { spaceNameId, challengeNameId, opportunityNameId },
        journey
      )!;
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
