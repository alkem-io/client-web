import { useTranslation } from 'react-i18next';
import {
  useExploreAllSpacesQuery,
  useExploreSpacesSearchQuery,
  useSpaceUrlResolverQuery,
  useWelcomeSpaceQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type ExploreSpacesSearchFragment,
  SearchCategory,
  SearchResultType,
} from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { TypedSearchResult } from '@/main/search/searchTypes';
import type { ExploreSpacesContainerEntities, SpaceWithParent } from './ExploreSpacesTypes';
import { SpacesExplorerMembershipFilter } from './ExploreSpacesView';

type FiltersConfigTranslation = {
  key: string;
  name: string;
  tags: string[];
};

interface UseExploreSpacesParams {
  searchTerms: string[];
  selectedFilter: string;
}

type UseExploreSpacesReturn = ExploreSpacesContainerEntities & {
  welcomeSpace: SpaceWithParent | undefined;
};

const useExploreSpaces = ({ searchTerms, selectedFilter }: UseExploreSpacesParams): UseExploreSpacesReturn => {
  const { t } = useTranslation();
  const { isAuthenticated } = useCurrentUserContext();
  const skipLeads = !isAuthenticated;
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
      spaceId: welcomeSpaceId ?? '',
      skipLeads,
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
      skipLeads,
    },
    fetchPolicy: 'no-cache',
    skip: !shouldSearch,
  });

  const { data: spacesData, loading: isLoadingSpaces } = useExploreAllSpacesQuery({
    variables: { skipLeads },
    skip: shouldSearch,
  });

  const loading = isLoadingSpaces || loadingSearchResults;

  const fetchMore = () => Promise.resolve();
  const hasMore = false;

  const flattenedSpaces = (() => {
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
  })();

  return {
    spaces: flattenedSpaces,
    searchTerms,
    selectedFilter,
    fetchMore,
    loading,
    hasMore,
    filtersConfig,
    welcomeSpace: welcomeSpaceData?.lookup.space as SpaceWithParent | undefined,
  };
};

export default useExploreSpaces;
