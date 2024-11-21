import { useMemo } from 'react';
import { useJourneyBreadcrumbsSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { JourneyPath } from '@/main/routing/resolvers/RouteResolver';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface BreadcrumbsItem {
  displayName: string;
  uri: string;
  avatar?: {
    uri?: string;
  };
}

export interface UseJourneyBreadcrumbsParams {
  journeyPath: JourneyPath;
  loading?: boolean;
}

export const useJourneyBreadcrumbs = ({ journeyPath, loading = false }: UseJourneyBreadcrumbsParams) => {
  const currentJourneyIndex = journeyPath.length - 1;

  const { data, loading: isLoadingBreadcrumbs } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceNameId: journeyPath[0]!,
      subspaceLevel1NameId: journeyPath[1]!,
      subspaceLevel2NameId: journeyPath[2]!,
      includeSubspaceLevel1: journeyPath.length > 1,
      includeSubspaceLevel2: journeyPath.length > 2,
      visualType: VisualType.Banner,
    },
    skip: !journeyPath || journeyPath.length === 0 || loading,
  });

  const journeyProfiles = [data?.space.profile, data?.space.subspace?.profile, data?.space.subspace?.subspace?.profile];

  const breadcrumbs = useMemo<BreadcrumbsItem[]>(() => {
    if (isLoadingBreadcrumbs) {
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
  }, [isLoadingBreadcrumbs, currentJourneyIndex, data]);

  return {
    loading: isLoadingBreadcrumbs,
    breadcrumbs,
  };
};
