import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useExploreAllSpacesQuery,
  useExploreSpacesSearchQuery,
  useWelcomeSpaceQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ExploreSpacesSearchFragment, SearchResultType } from '../../../../core/apollo/generated/graphql-schema';
import { TypedSearchResult } from '../../../search/SearchView';
import { ITEMS_LIMIT, SpacesExplorerMembershipFilter, SpaceWithParent } from './ExploreSpacesUnauthenticatedView';
import usePaginatedQuery from '../../../../domain/shared/pagination/usePaginatedQuery';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';

export interface ExploreSpacesContainerEntities {
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

interface ExploreSpacesUnauthenticatedContainerProps extends SimpleContainerProps<ExploreSpacesContainerEntities> {
  searchTerms: string[];
  selectedFilter: string;
}

const ExploreSpacesUnauthenticatedContainer = ({
  searchTerms,
  selectedFilter,
  children,
}: ExploreSpacesUnauthenticatedContainerProps) => {
  const { t } = useTranslation();
  const filtersConfig = t('spaces-filter.config', { returnObjects: true });
  const shouldSearch = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // the following query will return errors if the suggestedSpace is missing on the ENV (welcome-space)
  const { data: welcomeSpaceData } = useWelcomeSpaceQuery({
    variables: {
      spaceNameId: t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId'),
    },
    skip: !!shouldSearch,
  });

  // get translated tags based on the selected filter
  const getTerms = (searchTerms: string[], selectedFilter: string) => {
    if (selectedFilter !== SpacesExplorerMembershipFilter.All) {
      const filterData = filtersConfig.filter(data => data.key === selectedFilter);

      if (filterData.length > 0) {
        return [...filterData[0].tags, ...searchTerms];
      } else {
        return [...searchTerms];
      }
    }

    return [...searchTerms];
  };

  // PUBLIC: Search for spaces and subspaces
  const { data: rawSearchResults, loading: loadingSearchResults } = useExploreSpacesSearchQuery({
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
    useQuery: useExploreAllSpacesQuery,
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

  const loading = isLoadingSpaces || loadingSearchResults;

  const flattenedSpaces = useMemo<SpaceWithParent[] | undefined>(() => {
    if (shouldSearch && rawSearchResults?.search?.journeyResults) {
      return rawSearchResults.search.journeyResults
        .filter(
          (journey): journey is TypedSearchResult<SearchResultType.Space, ExploreSpacesSearchFragment> =>
            journey.type === SearchResultType.Space
        )
        .map(entry => ({
          ...entry.space,
          parent: undefined,
        }));
    }

    return spacesData?.spacesPaginated.spaces;
  }, [spacesData, selectedFilter, rawSearchResults]);

  const provided = {
    spaces: flattenedSpaces,
    searchTerms,
    selectedFilter,
    fetchMore,
    loading,
    hasMore,
    filtersConfig,
    welcomeSpace: welcomeSpaceData?.space,
  };

  return <>{children(provided)}</>;
};

export default ExploreSpacesUnauthenticatedContainer;
