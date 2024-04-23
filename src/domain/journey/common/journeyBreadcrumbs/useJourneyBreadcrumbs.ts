import { useMemo } from 'react';
import { useJourneyBreadcrumbsSpaceQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyLevel, JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';

export interface BreadcrumbsItem {
  displayName: string;
  uri: string;
  // journeyTypeName: JourneyTypeName;
  avatar?: {
    uri?: string;
  };
}

// const JOURNEY_NESTING: JourneyTypeName[] = ['space', 'subspace', 'subsubspace'];

export interface UseJourneyBreadcrumbsParams {
  journeyPath: JourneyPath;
  loading?: boolean;
}

export const useJourneyBreadcrumbs = ({ journeyPath, loading = false }: UseJourneyBreadcrumbsParams) => {
  const currentJourneyIndex = journeyPath.length - 1;

  const shouldFetchJourney = (level: JourneyLevel) => {
    return !!journeyPath[level];
  };

  const { data: _space, loading: isLoadingSpace } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: journeyPath[0]!,
    },
    skip: !shouldFetchJourney(0) || loading,
  });

  const { data: _challenge, loading: isLoadingChallenge } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: journeyPath[1]!,
    },
    skip: !shouldFetchJourney(1) || loading,
  });

  const { data: _opportunity, loading: isLoadingOpportunity } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: journeyPath[1]!,
    },
    skip: !shouldFetchJourney(2) || loading,
  });

  const journeyProfiles = [_space?.space.profile, _challenge?.space?.profile, _opportunity?.space?.profile];

  const isLoading = isLoadingSpace || isLoadingChallenge || isLoadingOpportunity;

  const breadcrumbs = useMemo<BreadcrumbsItem[]>(() => {
    if (isLoading) {
      return [];
    }

    return journeyProfiles.slice(0, currentJourneyIndex + 1).map(profile => {
      const displayName = profile?.displayName!;
      const journeyUri = profile?.url!;
      return {
        displayName,
        uri: journeyUri,
        // journeyTypeName: JOURNEY_NESTING[journey],
        avatar: profile?.avatar,
      };
    });
  }, [isLoading, currentJourneyIndex, _challenge, _space, _opportunity]);

  return {
    loading: isLoading,
    breadcrumbs,
  };
};
