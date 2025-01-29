import { useMemo } from 'react';
import { useJourneyBreadcrumbsSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { JourneyPath } from '@/main/routing/resolvers/RouteResolver';

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
      spaceId: journeyPath[0]!, //!!
      subspaceL1Id: journeyPath[1]!,
      subspaceL2Id: journeyPath[2]!,
      includeSubspaceL1: journeyPath.length > 1,
      includeSubspaceL2: journeyPath.length > 2
    },
    skip: !journeyPath || journeyPath.length === 0 || loading,
  });

  const journeyProfiles = [
    data?.lookupByName.space?.profile,
    data?.lookupByName.space?.subspaceByNameID?.profile,
    data?.lookupByName.space?.subspaceByNameID?.subspaceByNameID?.profile,
  ];

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
        avatar: profile?.avatar,
      };
    });
  }, [isLoadingBreadcrumbs, currentJourneyIndex, data]);

  return {
    loading: isLoadingBreadcrumbs,
    breadcrumbs,
  };
};
