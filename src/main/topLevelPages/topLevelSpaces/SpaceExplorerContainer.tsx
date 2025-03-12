import { Dispatch, useEffect, useMemo, useState } from 'react';
import {
  useChallengeExplorerPageQuery,
  useSpaceExplorerAllSpacesQuery,
  useSpaceExplorerMemberSpacesQuery,
  useSpaceExplorerSubspacesLazyQuery,
  useSpaceExplorerSearchQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '@/domain/community/user';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SearchResultType,
  SpaceExplorerSubspacesQuery,
  SpaceExplorerSearchSpaceFragment,
} from '@/core/apollo/generated/graphql-schema';
import { TypedSearchResult } from '@/main/search/SearchView';
import { ITEMS_LIMIT, SpacesExplorerMembershipFilter, SpaceWithParent } from './SpaceExplorerView';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { uniqBy } from 'lodash';

export interface ChallengeExplorerContainerEntities {
  spaces: SpaceWithParent[] | undefined;
  searchTerms: string[];
  membershipFilter: SpacesExplorerMembershipFilter;
  onMembershipFilterChange: Dispatch<SpacesExplorerMembershipFilter>;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
  authenticated: boolean;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  loadingSearchResults: boolean | null;
}

interface SpaceExplorerContainerProps extends SimpleContainerProps<ChallengeExplorerContainerEntities> {}

const SpaceExplorerContainer = ({ children }: SpaceExplorerContainerProps) => {
  const { user: userMetadata, isAuthenticated, loading: loadingUser } = useUserContext();

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [membershipFilter, setMembershipFilter] = useState(SpacesExplorerMembershipFilter.All);

  const shouldSearch = searchTerms.length > 0;

  // PRIVATE: Challenges if the user is logged in
  const { data: spaceMembershipsData, loading: loadingUserData } = useChallengeExplorerPageQuery({
    skip: !userMetadata?.user?.id || shouldSearch || membershipFilter !== SpacesExplorerMembershipFilter.Member,
  });

  const mySpaceIds = spaceMembershipsData?.me.spaceMembershipsFlat.map(space => space.id);

  const { data: challengesData, loading: isLoadingMemberSpaces } = useSpaceExplorerMemberSpacesQuery({
    variables: {
      spaceIDs: mySpaceIds,
    },
    skip: !mySpaceIds || shouldSearch,
  });

  // PUBLIC: Search for spaces and subspaces
  const { data: rawSearchResults, loading: loadingSearchResults } = useSpaceExplorerSearchQuery({
    variables: {
      searchData: {
        terms: searchTerms,
        tagsetNames: ['skills', 'keywords'],
        typesFilter: ['space', 'subspace'],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !shouldSearch,
  });

  const usesPagination =
    (membershipFilter === SpacesExplorerMembershipFilter.All ||
      membershipFilter === SpacesExplorerMembershipFilter.Public) &&
    !shouldSearch;

  const {
    data: spacesData,
    fetchMore: fetchMoreSpaces,
    loading: isLoadingSpaces,
    hasMore: hasMoreSpaces,
  } = usePaginatedQuery({
    useQuery: useSpaceExplorerAllSpacesQuery,
    pageSize: ITEMS_LIMIT,
    variables: {},
    getPageInfo: result => result.spacesPaginated.pageInfo,
    options: {
      skip: !usesPagination,
    },
  });

  const fetchMore = usesPagination ? fetchMoreSpaces : () => Promise.resolve();

  const hasMore = usesPagination ? hasMoreSpaces : false;

  const fetchedSpaces = useMemo(() => {
    switch (membershipFilter) {
      case SpacesExplorerMembershipFilter.All:
      case SpacesExplorerMembershipFilter.Public:
        return spacesData?.spacesPaginated.spaces;
      case SpacesExplorerMembershipFilter.Member:
        return challengesData?.spaces;
    }
  }, [challengesData, spacesData, membershipFilter]);

  // Spaces which allow this user read their subspaces:
  const readableSpacesIds = useMemo(
    () =>
      fetchedSpaces
        ?.filter(space => space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read))
        .map(space => space.id),
    [fetchedSpaces]
  );

  const [fetchSubspaces, { loading: loadingSubspaces }] = useSpaceExplorerSubspacesLazyQuery();
  const [fetchedSpacesWithSubspaces, setFetchedSpacesWithSubspaces] = useState<SpaceExplorerSubspacesQuery['spaces']>(
    []
  );

  useEffect(() => {
    const fetchSubspacesData = async () => {
      // Fetch the spaces that are not already fetched
      const missingSubspaces = readableSpacesIds?.filter(
        spaceId => !fetchedSpacesWithSubspaces.some(space => space.id === spaceId)
      );
      if (!missingSubspaces || missingSubspaces.length === 0) {
        return;
      }
      const { data } = await fetchSubspaces({
        variables: {
          IDs: missingSubspaces,
        },
      });
      setFetchedSpacesWithSubspaces(prev => uniqBy([...prev, ...(data?.spaces ?? [])], space => space.id));
    };
    fetchSubspacesData();
  }, [readableSpacesIds]);

  const loading =
    isLoadingSpaces ||
    isLoadingMemberSpaces ||
    loadingSearchResults ||
    loadingUserData ||
    loadingUser ||
    loadingSubspaces;

  const flattenedSpaces = useMemo<SpaceWithParent[] | undefined>(() => {
    if (shouldSearch) {
      return rawSearchResults?.search?.journeyResults.map(result => {
        const entry = result as TypedSearchResult<SearchResultType.Space, SpaceExplorerSearchSpaceFragment>;

        if (entry.type === SearchResultType.Space || entry.type === SearchResultType.Subspace) {
          return {
            ...entry.space,
            parent: undefined,
            matchedTerms: entry.terms,
          };
        }

        return null as never;
      });
    }

    return fetchedSpaces?.flatMap<SpaceWithParent>(space => {
      const subspaces = fetchedSpacesWithSubspaces?.find(
        spaceWithSubspaces => spaceWithSubspaces.id === space.id
      )?.subspaces;

      if (!subspaces || subspaces.length === 0) {
        return space;
      }
      return [
        space,
        ...subspaces.map(subspace => ({
          ...subspace,
          parent: space,
        })),
      ];
    });
  }, [challengesData, spacesData, membershipFilter, rawSearchResults, fetchedSpacesWithSubspaces]);

  const filteredSpaces = useMemo(() => {
    if (membershipFilter === SpacesExplorerMembershipFilter.Member) {
      if (!shouldSearch) {
        // already filtered by the query
        return flattenedSpaces;
      }
      return flattenedSpaces?.filter(
        space => space.about.membership?.myMembershipStatus === CommunityMembershipStatus.Member
      );
    }
    if (membershipFilter === SpacesExplorerMembershipFilter.Public) {
      return flattenedSpaces?.filter(space => space.about.isContentPublic);
    }
    return flattenedSpaces;
  }, [flattenedSpaces, membershipFilter, shouldSearch]);

  const provided = {
    spaces: filteredSpaces,
    authenticated: isAuthenticated,
    searchTerms,
    membershipFilter,
    onMembershipFilterChange: setMembershipFilter,
    fetchMore,
    loading,
    hasMore,
    setSearchTerms,
    loadingSearchResults,
  };

  return <>{children(provided)}</>;
};

export default SpaceExplorerContainer;
