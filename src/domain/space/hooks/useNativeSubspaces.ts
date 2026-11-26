import { useRef, useState } from 'react';
import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import { useNativeSubspacesQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { NativeSubspaceCardFragment, NativeSubspacesQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { appendPage, isSubspaceNode } from './useSpacePage';

type ParentSpace = Extract<NonNullable<NativeSubspacesQuery['node']>, { __typename?: 'Space' }>;
export const SPACES_FIRST = 500;

export function useNativeSubspaces(spaceId: string | undefined, skip = false) {
  const inFlight = useRef(new Set<string>());
  const [continuationError, setContinuationError] = useState<{ root: string; error: Error }>();
  const { data, loading, error, fetchMore, refetch } = useNativeSubspacesQuery({
    variables: { root: spaceId ?? '', first: SPACES_FIRST },
    skip: skip || !spaceId,
    notifyOnNetworkStatusChange: true,
  });

  if (!skip && spaceId && error) throw error;
  if (!skip && continuationError && continuationError.root === spaceId) throw continuationError.error;
  if (!skip && data && !loading && !data.node) throw new NotFoundError();

  const parent = !skip && data?.node && data.node.id === spaceId ? data.node : undefined;
  const space = parent?.entityType === 'space' ? (parent as ParentSpace) : undefined;
  const connection = space ? data?.spaces : undefined;
  // The space tree's rows of type space (subtree, types [space]).
  const subspaces: NativeSubspaceCardFragment[] | undefined = connection?.edges
    .map(edge => edge.node)
    .filter(isSubspaceNode);

  const loadMore = async () => {
    if (!spaceId || skip || loading || inFlight.current.has(spaceId) || !connection?.pageInfo.hasNextPage) return;
    inFlight.current.add(spaceId);
    try {
      const after = connection.pageInfo.endCursor;
      if (!after) throw new Error('Subspace continuation is missing its opaque cursor');
      // The tree has no cache merge: the continuation is appended to the stored list (as useSpaceExplorer).
      const result = await fetchMore({
        variables: { root: spaceId, first: SPACES_FIRST, after },
        updateQuery: (previous, { fetchMoreResult }) => ({
          ...previous,
          spaces: fetchMoreResult.spaces && appendPage(previous.spaces, fetchMoreResult.spaces),
        }),
      });
      const next = result.data.spaces;
      if (next?.pageInfo.hasNextPage && (!next.pageInfo.endCursor || next.pageInfo.endCursor === after)) {
        throw new Error('Subspace continuation did not advance its opaque cursor');
      }
    } catch (cause) {
      setContinuationError({
        root: spaceId,
        error: cause instanceof Error ? cause : new Error('Subspace continuation failed'),
      });
    } finally {
      inFlight.current.delete(spaceId);
    }
  };

  return {
    space,
    subspaces,
    loading,
    hasMore: connection?.pageInfo.hasNextPage ?? false,
    totalCount: connection?.totalCount,
    loadMore,
    refetch,
    showPins: (space?.settings as { sort_mode?: string } | null)?.sort_mode === 'alphabetical',
  };
}
