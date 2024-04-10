import { useMemo } from 'react';
import { useJourneyBreadcrumbsSpaceQuery } from '../../../../core/apollo/generated/apollo-hooks';
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

const JOURNEY_NESTING: JourneyTypeName[] = ['space', 'subspace', 'subsubspace'];

export const useJourneyBreadcrumbs = () => {
  const { spaceId, subSpaceId, subSubSpaceId, journeyTypeName, loading } = useRouteResolver();

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

  const { data: _challenge, loading: isLoadingChallenge } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: subSpaceId!,
    },
    skip: !shouldFetchJourney('subspace') || loading,
  });

  const { data: _opportunity, loading: isLoadingOpportunity } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: subSubSpaceId!,
    },
    skip: !shouldFetchJourney('subsubspace') || loading,
  });

  const getJourneyProfile = (journey: JourneyTypeName) => {
    switch (journey) {
      case 'space':
        return _space?.space.profile;
      case 'subspace':
        return _challenge?.space?.profile;
      case 'subsubspace':
        return _opportunity?.space?.profile;
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
