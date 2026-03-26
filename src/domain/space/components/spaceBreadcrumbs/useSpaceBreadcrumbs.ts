import { compact } from 'lodash-es';
import { useSpaceBreadcrumbsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { SpaceHierarchyPath } from '@/main/routing/urlResolver/UrlResolverProvider';

export interface BreadcrumbsItem {
  displayName: string;
  uri: string;
  level: SpaceLevel;
  avatar?: {
    uri?: string;
  };
}

export interface UseSpaceBreadcrumbsParams {
  spaceHierarchyPath: SpaceHierarchyPath | undefined;
  loading?: boolean;
}

export const useSpaceBreadcrumbs = ({ spaceHierarchyPath = [], loading = false }: UseSpaceBreadcrumbsParams) => {
  const currentSpaceIndex = spaceHierarchyPath.length - 1;

  const { data, loading: isLoadingBreadcrumbs } = useSpaceBreadcrumbsQuery({
    variables: {
      spaceId: spaceHierarchyPath[0]!,
      subspaceL1Id: spaceHierarchyPath[1],
      subspaceL2Id: spaceHierarchyPath[2],
      includeSubspaceL1: spaceHierarchyPath.length > 1,
      includeSubspaceL2: spaceHierarchyPath.length > 2,
    },
    skip: !spaceHierarchyPath || spaceHierarchyPath.length === 0 || loading,
  });

  const pathSpaces = compact([data?.lookup.space, data?.lookup.subspaceL1, data?.lookup.subspaceL2]);

  const breadcrumbs = (() => {
    if (isLoadingBreadcrumbs) {
      return [];
    }

    return pathSpaces.slice(0, currentSpaceIndex + 1).map(space => {
      const profile = space.about.profile;
      const displayName = profile.displayName!;
      const spaceUri = profile.url!;
      return {
        displayName,
        uri: spaceUri,
        level: space.level,
        avatar: profile?.avatar,
      };
    });
  })();

  return {
    loading: isLoadingBreadcrumbs,
    breadcrumbs,
  };
};
