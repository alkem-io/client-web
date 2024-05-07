import { Dispatch, useEffect, useMemo, useState } from 'react';
import {
  useChallengeExplorerPageQuery,
  useSpaceExplorerAllSpacesQuery,
  useSpaceExplorerMemberSpacesQuery,
  useSpaceExplorerSearchQuery,
  useSpaceExplorerSubspacesLazyQuery,
  useSpaceExplorerWelcomeSpaceLazyQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../domain/community/user';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SearchResultType,
  SpaceExplorerSearchSpaceFragment,
} from '../../../core/apollo/generated/graphql-schema';
import { TypedSearchResult } from '../../search/SearchView';
import { ITEMS_LIMIT, SpacesExplorerMembershipFilter, SpaceWithParent } from './SpaceExplorerView';
import usePaginatedQuery from '../../../domain/shared/pagination/usePaginatedQuery';
import { SimpleContainerProps } from '../../../core/container/SimpleContainer';

export interface ChallengeExplorerContainerEntities {
  spaces: SpaceWithParent[] | undefined;
  searchTerms: string[];
  membershipFilter: SpacesExplorerMembershipFilter;
  onMembershipFilterChange: Dispatch<SpacesExplorerMembershipFilter>;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
  authenticated: boolean;
  welcomeSpace:
    | {
        displayName: string;
        url: string;
      }
    | undefined;
  fetchWelcomeSpace?: (args: { variables: { spaceId: string } }) => void;
}

interface SpaceExplorerContainerProps extends SimpleContainerProps<ChallengeExplorerContainerEntities> {
  searchTerms: string[];
}

interface SpaceWithReadAccess {
  id: string;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}

type SpaceWithHierarchy<Space extends SpaceWithReadAccess> = Space & {
  subspaces?: Space[];
  parent?: Space;
};

interface FetchedSpace<Subspace extends SpaceWithReadAccess> {
  id: string;
  subspaces?: Subspace[];
}

interface FetchSubspaces<Subspace extends SpaceWithReadAccess> {
  (args: { variables: { IDs: string[] } }): Promise<{ data?: { spaces: FetchedSpace<Subspace>[] } }>;
}

const collectSubspaces = async <Collected extends SpaceWithReadAccess>(
  spaces: SpaceWithHierarchy<Collected>[],
  fetchSubspaces: FetchSubspaces<Collected>
): Promise<SpaceWithHierarchy<Collected>[]> => {
  const readableSpaces = spaces.filter(space =>
    space.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read)
  );
  const readableSpaceIds = readableSpaces.map(space => space.id);
  const { data } = await fetchSubspaces({ variables: { IDs: readableSpaceIds } });
  const subspaces =
    data?.spaces.flatMap(
      space =>
        space.subspaces?.map(subspace => ({
          ...subspace,
          parent: readableSpaces.find(parent => parent.id === space.id),
        })) ?? []
    ) ?? [];
  const collected = await collectSubspaces(subspaces, fetchSubspaces);
  return [...spaces, ...subspaces, ...collected];
};

const SpaceExplorerContainer = ({ searchTerms, children }: SpaceExplorerContainerProps) => {
  const { user: userMetadata, isAuthenticated, loading: loadingUser } = useUserContext();

  const shouldSearch = searchTerms.length > 0;

  const [membershipFilter, setMembershipFilter] = useState(SpacesExplorerMembershipFilter.All);

  // PRIVATE: Challenges if the user is logged in
  const { data: spaceMembershipsData, loading: loadingUserData } = useChallengeExplorerPageQuery({
    skip: !userMetadata?.user?.id || shouldSearch || membershipFilter !== SpacesExplorerMembershipFilter.Member,
  });

  const mySpaceIds = spaceMembershipsData?.me.spaceMemberships.map(space => space.id);

  const { data: challengesData, loading: isLoadingMemberSpaces } = useSpaceExplorerMemberSpacesQuery({
    variables: {
      spaceIDs: mySpaceIds,
    },
    skip: !mySpaceIds || shouldSearch,
    errorPolicy: 'ignore',
  });

  // PUBLIC: Search for challenges
  const { data: rawSearchResults, loading: loadingSearchResults } = useSpaceExplorerSearchQuery({
    variables: {
      searchData: {
        terms: searchTerms,
        tagsetNames: ['skills', 'keywords'],
        typesFilter: ['space', 'challenge'],
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
      errorPolicy: 'ignore',
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

  const [fetchSubspaces, { loading: loadingSubspaces }] = useSpaceExplorerSubspacesLazyQuery();
  const [fetchedSpacesWithSubspaces, setFetchedSpacesWithSubspaces] = useState<SpaceWithParent[]>([]);

  useEffect(() => {
    (async () => {
      const collected = await collectSubspaces(fetchedSpaces ?? [], fetchSubspaces);
      setFetchedSpacesWithSubspaces(collected);
    })();
  }, [fetchedSpaces]);

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

        if (entry.type === SearchResultType.Space) {
          return {
            ...entry.space,
            parent: undefined,
            matchedTerms: entry.terms,
          };
        }

        return null as never;
      });
    }

    return fetchedSpacesWithSubspaces;
  }, [challengesData, spacesData, membershipFilter, rawSearchResults, fetchedSpacesWithSubspaces]);

  const filteredSpaces = useMemo(() => {
    if (membershipFilter === SpacesExplorerMembershipFilter.Member) {
      if (!shouldSearch) {
        // already filtered by the query
        return flattenedSpaces;
      }
      return flattenedSpaces?.filter(space => space.community?.myMembershipStatus === CommunityMembershipStatus.Member);
    }
    if (membershipFilter === SpacesExplorerMembershipFilter.Public) {
      return flattenedSpaces?.filter(space => space.authorization?.anonymousReadAccess);
    }
    return flattenedSpaces;
  }, [flattenedSpaces, membershipFilter, shouldSearch]);

  const [fetchWelcomeSpace, { data: welcomeSpaceData }] = useSpaceExplorerWelcomeSpaceLazyQuery();

  const provided = {
    spaces: filteredSpaces,
    authenticated: isAuthenticated,
    searchTerms,
    membershipFilter,
    onMembershipFilterChange: setMembershipFilter,
    fetchMore,
    loading,
    hasMore,
    welcomeSpace: welcomeSpaceData?.space.profile,
    fetchWelcomeSpace,
  };

  return <>{children(provided)}</>;
};

export default SpaceExplorerContainer;
