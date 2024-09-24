import { useMemo } from 'react';
import {
  useSpaceExplorerAllSpacesQuery,
  useSpaceExplorerSearchQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { SearchResultType, SpaceExplorerSearchSpaceFragment } from '../../../core/apollo/generated/graphql-schema';
import { TypedSearchResult } from '../../search/SearchView';
import { ITEMS_LIMIT, SpacesExplorerMembershipFilter, SpaceWithParent } from './SpaceExplorerUnauthenticatedView';
import usePaginatedQuery from '../../../domain/shared/pagination/usePaginatedQuery';
import { SimpleContainerProps } from '../../../core/container/SimpleContainer';

export interface ChallengeExplorerContainerEntities {
  spaces: SpaceWithParent[] | undefined;
  searchTerms: string[];
  selectedFilter: SpacesExplorerMembershipFilter;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
}

interface SpaceExplorerUnauthenticatedContainerProps extends SimpleContainerProps<ChallengeExplorerContainerEntities> {
  searchTerms: string[];
  selectedFilter: SpacesExplorerMembershipFilter;
}

const getTerms = (searchTerms: string[], selectedFilter: SpacesExplorerMembershipFilter) => {
  const filterArray = selectedFilter !== SpacesExplorerMembershipFilter.All ? [selectedFilter] : [];
  return [...filterArray, ...searchTerms];
};

const SpaceExplorerUnauthenticatedContainer = ({
  searchTerms,
  selectedFilter,
  children,
}: SpaceExplorerUnauthenticatedContainerProps) => {
  const shouldSearch = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // PUBLIC: Search for spaces and subspaces
  const { data: rawSearchResults, loading: loadingSearchResults } = useSpaceExplorerSearchQuery({
    variables: {
      searchData: {
        terms: getTerms(searchTerms, selectedFilter),
        tagsetNames: ['skills', 'keywords'],
        typesFilter: ['space'],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !shouldSearch,
  });

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
      skip: !!shouldSearch,
      errorPolicy: 'ignore',
    },
  });

  const fetchMore = !shouldSearch ? fetchMoreSpaces : () => Promise.resolve();

  const hasMore = !shouldSearch ? hasMoreSpaces : false;

  const fetchedSpaces = useMemo(() => {
    return spacesData?.spacesPaginated.spaces;
  }, [spacesData, selectedFilter]);

  const loading = isLoadingSpaces || loadingSearchResults;

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

    return fetchedSpaces;
  }, [spacesData, selectedFilter, rawSearchResults]);

  const provided = {
    spaces: flattenedSpaces,
    searchTerms,
    selectedFilter,
    fetchMore,
    loading,
    hasMore,
  };

  return <>{children(provided)}</>;
};

export default SpaceExplorerUnauthenticatedContainer;
