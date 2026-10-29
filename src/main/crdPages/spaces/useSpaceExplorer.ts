import { useEffect, useRef, useState } from 'react';
import {
  useMySpacesExplorerPageQuery,
  useSpaceExplorerAllSpacesQuery,
  useSpaceExplorerMemberSpacesQuery,
  useSpaceExplorerSearchQuery,
  useSpaceExplorerSubspacesLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SearchCategory,
  SearchResultType,
  type SpaceExplorerSearchSpaceFragment,
  type SpaceExplorerSubspacesQuery,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import type { SpacePrivacyFilter, SpacesFilterValue, SpaceTypeFilter } from '@/crd/components/space/SpaceExplorer';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { TypedSearchResult } from '@/main/search/searchTypes';
import type { SpaceWithParent } from './SpaceExplorerPage';

/** Cards per batch: a multiple of 1, 2, 3 and 4 grid columns, so only the last batch leaves a row part-empty. */
export const BATCH_SIZE = 24;

/** Top-level spaces per page when their subspaces are shown too — each one brings its subspaces along. */
export const ITEMS_LIMIT = 10;

type Subspaces = NonNullable<SpaceExplorerSubspacesQuery['spaces'][number]['subspaces']>;

export interface SpacesExplorerContainerEntities {
  spaces: SpaceWithParent[] | undefined;
  searchTerms: string[];
  membershipFilter: SpacesFilterValue;
  onMembershipFilterChange: (filter: SpacesFilterValue) => void;
  typeFilter: SpaceTypeFilter;
  onTypeFilterChange: (filter: SpaceTypeFilter) => void;
  privacyFilter: SpacePrivacyFilter;
  onPrivacyFilterChange: (filter: SpacePrivacyFilter) => void;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
  authenticated: boolean;
  setSearchTerms: (terms: string[]) => void;
  loadingSearchResults: boolean;
}

/**
 * Spec 039 explore-filters-and-count: Type and Privacy filter here, not in the view, so that every view shows
 * full batches of BATCH_SIZE cards — the hook keeps loading server pages until a batch is full.
 */
const useSpaceExplorer = (): SpacesExplorerContainerEntities => {
  const { userModel, isAuthenticated, loading: loadingUser } = useCurrentUserContext();

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [membershipFilter, setMembershipFilter] = useState<SpacesFilterValue>('all');
  // undefined = the user hasn't picked a Type: "Spaces only" while browsing, "All" while searching (#10405).
  const [chosenTypeFilter, setChosenTypeFilter] = useState<SpaceTypeFilter>();
  const [privacyFilter, setPrivacyFilter] = useState<SpacePrivacyFilter>('all');
  const [batches, setBatches] = useState(1);

  const shouldSearch = searchTerms.length > 0;
  const typeFilter = chosenTypeFilter ?? (shouldSearch ? 'all' : 'spaces');
  const visibleCount = batches * BATCH_SIZE;

  // Every filter change starts again from one batch.
  const changeFilter =
    <T>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setBatches(1);
    };

  // PRIVATE: Spaces if the user is logged in
  const { data: spaceMembershipsData, loading: loadingUserData } = useMySpacesExplorerPageQuery({
    skip: !userModel?.id || shouldSearch || membershipFilter !== 'member',
  });

  const mySpaceIds = spaceMembershipsData?.me.spaceMembershipsFlat.map(space => space.id);

  const { data: spacesExplorerData, loading: isLoadingMemberSpaces } = useSpaceExplorerMemberSpacesQuery({
    variables: {
      spaceIDs: mySpaceIds,
    },
    skip: !mySpaceIds || shouldSearch,
  });

  // PUBLIC: Search for spaces and subspaces
  const {
    data: rawSearchResults,
    loading: loadingSearchResults,
    fetchMore: fetchMoreSearchResultsRaw,
  } = useSpaceExplorerSearchQuery({
    variables: {
      searchData: {
        terms: searchTerms,
        tagsetNames: ['skills', 'keywords'],
        filters: [
          {
            category: SearchCategory.Spaces,
            size: BATCH_SIZE,
          },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !shouldSearch,
  });

  // A null cursor means the search has no more results.
  const searchCursor = rawSearchResults?.search.spaceResults?.cursor;

  const fetchMoreSearchResults = async () => {
    if (!searchCursor) {
      return;
    }

    await fetchMoreSearchResultsRaw({
      variables: {
        searchData: {
          terms: searchTerms,
          tagsetNames: ['skills', 'keywords'],
          filters: [{ category: SearchCategory.Spaces, size: BATCH_SIZE, cursor: searchCursor }],
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const prevResults = prev.search.spaceResults;
        const nextResults = fetchMoreResult.search.spaceResults;
        if (!prevResults || !nextResults) {
          return prev;
        }
        return {
          ...prev,
          search: {
            ...prev.search,
            spaceResults: { ...nextResults, results: [...prevResults.results, ...nextResults.results] },
          },
        };
      },
    });
  };

  const usesPagination = membershipFilter === 'all' && !shouldSearch;
  // "Spaces only" needs no subspaces, so one page of top-level spaces is exactly one batch.
  const withSubspaces = typeFilter !== 'spaces';
  const pageSize = withSubspaces ? ITEMS_LIMIT : BATCH_SIZE;

  const {
    data: spacesData,
    fetchMore: fetchMoreSpacesRaw,
    loading: isLoadingSpaces,
  } = useSpaceExplorerAllSpacesQuery({
    variables: {
      first: pageSize,
    },
    skip: !usesPagination,
  });

  const spacePageInfo = spacesData?.spacesPaginated.pageInfo;
  const hasMoreSpaces = spacePageInfo?.hasNextPage ?? false;

  const fetchMoreSpaces = async () => {
    if (!spacesData) {
      return;
    }

    await fetchMoreSpacesRaw({
      variables: {
        first: pageSize,
        after: spacePageInfo?.endCursor,
      },
    });
  };

  const fetchNextPage = shouldSearch ? fetchMoreSearchResults : usesPagination ? fetchMoreSpaces : undefined;
  const serverHasMore = shouldSearch ? !!searchCursor : usesPagination ? hasMoreSpaces : false;

  const fetchedSpaces = (() => {
    switch (membershipFilter) {
      case 'all':
        return spacesData?.spacesPaginated.spaces;
      case 'member':
        return spacesExplorerData?.spaces;
    }
  })();

  // Spaces which allow this user read their subspaces:
  const readableSpacesIds = withSubspaces
    ? fetchedSpaces
        ?.filter(space => space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read))
        .map(space => space.id)
    : undefined;

  const [fetchSubspaces, { loading: loadingSubspaces }] = useSpaceExplorerSubspacesLazyQuery();
  // Keyed by parent id; a parent is in here once its subspaces were requested, even if that request failed.
  const [subspacesByParent, setSubspacesByParent] = useState<Record<string, Subspaces>>({});
  const requestedSubspaces = useRef(new Set<string>());

  const missingSubspaceIds = readableSpacesIds?.filter(spaceId => !(spaceId in subspacesByParent)) ?? [];

  useEffect(() => {
    const fetchSubspacesData = async () => {
      const toRequest = missingSubspaceIds.filter(spaceId => !requestedSubspaces.current.has(spaceId));
      if (toRequest.length === 0) {
        return;
      }
      for (const spaceId of toRequest) {
        requestedSubspaces.current.add(spaceId);
      }
      const { data } = await fetchSubspaces({
        variables: {
          IDs: toRequest,
        },
      });
      setSubspacesByParent(prev => ({
        ...prev,
        ...Object.fromEntries(
          toRequest.map(spaceId => [spaceId, data?.spaces.find(space => space.id === spaceId)?.subspaces ?? []])
        ),
      }));
    };
    fetchSubspacesData();
  }, [missingSubspaceIds.join()]);

  const flattenedSpaces = (() => {
    if (shouldSearch) {
      return rawSearchResults?.search?.spaceResults?.results.flatMap(result => {
        const entry = result as TypedSearchResult<SearchResultType.Space, SpaceExplorerSearchSpaceFragment>;

        if (entry.type === SearchResultType.Space || entry.type === SearchResultType.Subspace) {
          return {
            ...entry.space,
            parent: undefined,
            matchedTerms: entry.terms,
          };
        }

        return [];
      });
    }

    // Only the spaces before the first one still waiting for its subspaces: what is on screen is always the start
    // of the final order, so nothing gets inserted between or moved ahead of cards already shown.
    const firstPending = fetchedSpaces?.findIndex(space => missingSubspaceIds.includes(space.id)) ?? -1;
    const ready = firstPending === -1 ? fetchedSpaces : fetchedSpaces?.slice(0, firstPending);

    return ready?.flatMap<SpaceWithParent>(space => {
      if (!withSubspaces) {
        return space;
      }
      const subspaces = subspacesByParent[space.id] ?? [];
      return [
        space,
        ...subspaces.map(subspace => ({
          ...subspace,
          parent: space,
        })),
      ];
    });
  })();

  const filteredSpaces = flattenedSpaces?.filter(space => {
    if (
      membershipFilter === 'member' &&
      shouldSearch &&
      space.about.membership?.myMembershipStatus !== CommunityMembershipStatus.Member
    ) {
      return false;
    }
    if (typeFilter === 'spaces' && space.level !== SpaceLevel.L0) return false;
    if (typeFilter === 'subspaces' && space.level === SpaceLevel.L0) return false;
    if (privacyFilter === 'public' && !space.about.isContentPublic) return false;
    if (privacyFilter === 'private' && space.about.isContentPublic) return false;
    return true;
  });

  const matchingCount = filteredSpaces?.length ?? 0;
  const busy =
    isLoadingSpaces ||
    isLoadingMemberSpaces ||
    loadingSearchResults ||
    loadingUserData ||
    loadingUser ||
    loadingSubspaces ||
    missingSubspaceIds.length > 0;

  // Fill the current batch: fetch one more server page at a time while too few cards match.
  const [fetchingPage, setFetchingPage] = useState(false);
  // The batch a page failed to fill; filling resumes on the next Load more instead of retrying in a loop.
  const [failedBatch, setFailedBatch] = useState<number>();
  const needsPage = !!fetchNextPage && matchingCount < visibleCount && serverHasMore && failedBatch !== batches;
  const filling = busy || fetchingPage || needsPage;

  useEffect(() => {
    if (!needsPage || busy || fetchingPage || !fetchNextPage) {
      return;
    }
    setFetchingPage(true);
    fetchNextPage()
      .catch(() => setFailedBatch(batches))
      .finally(() => setFetchingPage(false));
  }, [needsPage, busy, fetchingPage]);

  // Load more resolves once its batch is full (or nothing more can be loaded), keeping its button busy until then.
  const pendingLoadMore = useRef<(() => void)[]>([]);
  useEffect(() => {
    if (filling) {
      return;
    }
    for (const resolve of pendingLoadMore.current.splice(0)) {
      resolve();
    }
  }, [filling, batches]);

  const fetchMore = () =>
    new Promise<void>(resolve => {
      pendingLoadMore.current.push(resolve);
      setBatches(count => count + 1);
    });

  return {
    spaces: filteredSpaces?.slice(0, visibleCount),
    authenticated: isAuthenticated,
    searchTerms,
    membershipFilter,
    onMembershipFilterChange: changeFilter(setMembershipFilter),
    typeFilter,
    onTypeFilterChange: changeFilter(setChosenTypeFilter),
    privacyFilter,
    onPrivacyFilterChange: changeFilter(setPrivacyFilter),
    fetchMore,
    loading: filling,
    hasMore: matchingCount > visibleCount || serverHasMore,
    setSearchTerms: changeFilter(setSearchTerms),
    loadingSearchResults: loadingSearchResults ?? false,
  };
};

export default useSpaceExplorer;
