import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  selectedFilter: string;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
  filtersConfig: {
    key: string;
    name: string;
    tags: string[];
  }[];
}

interface SpaceExplorerUnauthenticatedContainerProps extends SimpleContainerProps<ChallengeExplorerContainerEntities> {
  searchTerms: string[];
  selectedFilter: string;
}

const SpaceExplorerUnauthenticatedContainer = ({
  searchTerms,
  selectedFilter,
  children,
}: SpaceExplorerUnauthenticatedContainerProps) => {
  const { t } = useTranslation();
  const filtersConfig = t('spaces-filter.config', { returnObjects: true });
  const shouldSearch = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // get translated tags based on the selected filter
  const getTerms = (searchTerms: string[], selectedFilter: string) => {
    if (selectedFilter !== SpacesExplorerMembershipFilter.All) {
      const filterData = filtersConfig.filter(data => data.key === selectedFilter);

      return [...filterData[0].tags, ...searchTerms];
    }

    return [...searchTerms];
  };

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
    filtersConfig,
  };

  return <>{children(provided)}</>;
};

export default SpaceExplorerUnauthenticatedContainer;
