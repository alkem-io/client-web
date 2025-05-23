import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useExploreAllSpacesQuery,
  useExploreSpacesSearchQuery,
  useSpaceUrlResolverQuery,
  useWelcomeSpaceQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ExploreSpacesSearchFragment, SearchCategory, SearchResultType } from '@/core/apollo/generated/graphql-schema';
import { TypedSearchResult } from '@/main/search/SearchView';
import { SpacesExplorerMembershipFilter } from './ExploreSpacesView';
import { ExploreSpacesContainerProps, SpaceWithParent } from './ExploreSpacesTypes';

type FiltersConfigTranslation = {
  key: string;
  name: string;
  tags: string[];
};

const ExploreSpacesContainer = ({ searchTerms, selectedFilter, children }: ExploreSpacesContainerProps) => {
  const { t } = useTranslation();
  const filtersConfigRaw = t('spaces-filter.config', { returnObjects: true });
  const filtersConfig: FiltersConfigTranslation[] = Array.isArray(filtersConfigRaw)
    ? filtersConfigRaw
    : Object.values(filtersConfigRaw);
  const shouldSearch = searchTerms.length > 0 || selectedFilter !== SpacesExplorerMembershipFilter.All;

  // the following query will return errors if the suggestedSpace is missing on the ENV (welcome-space)
  const welcomeSpaceNameId = t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId');
  const { data: resolveSpaceData } = useSpaceUrlResolverQuery({
    variables: {
      spaceNameId: welcomeSpaceNameId,
    },
    skip: !shouldSearch || !welcomeSpaceNameId,
  });
  const welcomeSpaceId = resolveSpaceData?.lookupByName.space?.id;
  const { data: welcomeSpaceData } = useWelcomeSpaceQuery({
    variables: {
      spaceId: welcomeSpaceId!,
    },
    skip: shouldSearch || !welcomeSpaceId,
  });

  // get translated tags based on the selected filter
  const getTerms = (searchTerms: string[], selectedFilter: string) => {
    if (selectedFilter !== SpacesExplorerMembershipFilter.All) {
      const filtersArray: FiltersConfigTranslation[] = Array.isArray(filtersConfig)
        ? filtersConfig
        : Object.values(filtersConfig);
      const filterData = filtersArray.filter(data => data.key === selectedFilter);

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
        filters: [
          {
            category: SearchCategory.Spaces,
            types: [SearchResultType.Space],
          },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !shouldSearch,
  });

  /*const {
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
    },
  });*/
  const { data: spacesData, loading: isLoadingSpaces } = useExploreAllSpacesQuery({
    skip: shouldSearch,
  });

  // const fetchMore = !shouldSearch ? fetchMoreSpaces : () => Promise.resolve();

  // const hasMore = !shouldSearch ? hasMoreSpaces : false;

  const loading = isLoadingSpaces || loadingSearchResults;

  const fetchMore = () => Promise.resolve();
  const hasMore = false;

  const flattenedSpaces = useMemo<SpaceWithParent[] | undefined>(() => {
    if (shouldSearch && rawSearchResults?.search?.spaceResults) {
      return rawSearchResults.search.spaceResults?.results
        .filter(
          (space): space is TypedSearchResult<SearchResultType.Space, ExploreSpacesSearchFragment> =>
            space.type === SearchResultType.Space
        )
        .map(entry => ({
          ...entry.space,
          parent: undefined,
        }));
    }

    return spacesData?.exploreSpaces;
  }, [spacesData, selectedFilter, rawSearchResults]);

  const provided = {
    spaces: flattenedSpaces,
    searchTerms,
    selectedFilter,
    fetchMore,
    loading,
    hasMore,
    filtersConfig,
    welcomeSpace: welcomeSpaceData?.lookup.space,
  };

  return <>{children(provided)}</>;
};

export default ExploreSpacesContainer;
