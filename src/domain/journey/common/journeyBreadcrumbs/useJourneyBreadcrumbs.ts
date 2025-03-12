import { useMemo } from 'react';
import { useJourneyBreadcrumbsSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { compact } from 'lodash';

export interface BreadcrumbsItem {
  displayName: string;
  uri: string;
  level: SpaceLevel;
  avatar?: {
    uri?: string;
  };
}

export interface UseJourneyBreadcrumbsParams {
  journeyPath: JourneyPath | undefined;
  loading?: boolean;
}

export const useJourneyBreadcrumbs = ({ journeyPath = [], loading = false }: UseJourneyBreadcrumbsParams) => {
  const currentJourneyIndex = journeyPath.length - 1;

  const { data, loading: isLoadingBreadcrumbs } = useJourneyBreadcrumbsSpaceQuery({
    variables: {
      spaceId: journeyPath[0]!,
      subspaceL1Id: journeyPath[1],
      subspaceL2Id: journeyPath[2],
      includeSubspaceL1: journeyPath.length > 1,
      includeSubspaceL2: journeyPath.length > 2,
    },
    skip: !journeyPath || journeyPath.length === 0 || loading,
  });

  const pathSpaces = compact([data?.lookup.space, data?.lookup.subspaceL1, data?.lookup.subspaceL2]);

  const breadcrumbs = useMemo<BreadcrumbsItem[]>(() => {
    if (isLoadingBreadcrumbs) {
      return [];
    }

    return pathSpaces.slice(0, currentJourneyIndex + 1).map(space => {
      const profile = space.about.profile;
      const displayName = profile.displayName!;
      const journeyUri = profile.url!;
      return {
        displayName,
        uri: journeyUri,
        level: space.level,
        avatar: profile?.avatar,
      };
    });
  }, [isLoadingBreadcrumbs, currentJourneyIndex, data]);

  return {
    loading: isLoadingBreadcrumbs,
    breadcrumbs,
  };
};
