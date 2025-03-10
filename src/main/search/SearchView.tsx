import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import {
  useSearchQuery,
  useSearchScopeDetailsSpaceQuery,
  useSpaceUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  SearchQuery,
  SearchResult,
  SearchResultCalloutFragment,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
} from '@/core/apollo/generated/graphql-schema';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useUserContext } from '@/domain/community/user';
import {
  calloutFilterConfig,
  contributionFilterConfig,
  contributorFilterConfig,
  FilterConfig,
  FilterDefinition,
} from './Filter';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import SearchResultSection from './SearchResultSection';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { buildLoginUrl } from '../routing/urlBuilders';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from './constants';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import SearchResultsScope from '@/core/ui/search/SearchResultsScope';
import SearchResultsScopeCard from '@/core/ui/search/SearchResultsScopeCard';
import AlkemioLogo from '../ui/logo/logoSmall.svg?react';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import { findKey, groupBy, identity } from 'lodash';
import SearchResultPostChooser from './searchResults/SearchResultPostChooser';
import SearchResultsCalloutCard from './searchResults/searchResultsCallout/SearchResultsCalloutCard';

export const MAX_TERMS_SEARCH = 5;

const tagsetNames = ['skills', 'keywords'];

export type TypedSearchResult<Type extends SearchResultType, ResultFragment extends {}> = SearchResult &
  ResultFragment & { type: Type };

export type SearchResultMetaType =
  | TypedSearchResult<SearchResultType.User, SearchResultUserFragment>
  | TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  | TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>
  | TypedSearchResult<SearchResultType.Space, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Subspace, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Callout, SearchResultCalloutFragment>;

interface SearchViewProps {
  searchRoute: string;
  journeyFilterConfig: FilterConfig;
  journeyFilterTitle: ReactNode;
}

interface SearchViewSections {
  spaceResults?: SearchResultMetaType[];
  calloutResults?: SearchResultMetaType[];
  contributionResults?: SearchResultMetaType[];
  contributorResults?: SearchResultMetaType[];
}

const searchResultSectionTypes: Record<keyof SearchViewSections, SearchResultType[]> = {
  spaceResults: [SearchResultType.Space, SearchResultType.Subspace],
  calloutResults: [SearchResultType.Callout],
  contributionResults: [SearchResultType.Post],
  contributorResults: [SearchResultType.User, SearchResultType.Organization],
};

const Logo = () => <AlkemioLogo />;

const SearchView = ({ searchRoute, journeyFilterConfig, journeyFilterTitle }: SearchViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();

  const queryParams = useQueryParams();

  const spaceNameId = queryParams.get(SEARCH_SPACE_URL_PARAM) ?? undefined;

  const termsFromUrl = useMemo(() => {
    const terms = queryParams.getAll(SEARCH_TERMS_URL_PARAM).filter(identity);
    if (terms.length > MAX_TERMS_SEARCH) {
      // All terms above 4th are joined into a single 5th term
      // That is mainly coming from UX issues when having more than 5 tags in the Search input
      // Please note that server also puts certain limits on the maximum number of terms (currently 10)
      return [...terms.slice(0, MAX_TERMS_SEARCH - 1), terms.slice(MAX_TERMS_SEARCH - 1).join(' ')];
    }
    return terms;
  }, [queryParams]);

  const searchTerms = termsFromUrl;

  const [journeyFilter, setJourneyFilter] = useState<FilterDefinition>(journeyFilterConfig.all);
  const [contributionFilter, setContributionFilter] = useState<FilterDefinition>(contributionFilterConfig.all);
  const [contributorFilter, setContributorFilter] = useState<FilterDefinition>(contributorFilterConfig.all);
  const [calloutFilter, setCalloutFilter] = useState<FilterDefinition>(calloutFilterConfig.all);

  const resetFilters = () => {
    setJourneyFilter(journeyFilterConfig.all);
    setContributionFilter(contributionFilterConfig.all);
    setContributorFilter(contributorFilterConfig.all);
  };

  useEffect(() => {
    if (termsFromUrl.length === 0) {
      resetFilters();
    }
  }, [termsFromUrl.length]);

  const handleTermsChange = (newValue: string[]) => {
    const params = new URLSearchParams(queryParams);
    params.delete(SEARCH_TERMS_URL_PARAM);
    for (const term of newValue) {
      params.append(SEARCH_TERMS_URL_PARAM, term);
    }
    if (newValue.length === 0) {
      // Keeping the dialog open when there are no search terms
      params.append(SEARCH_TERMS_URL_PARAM, '');
    }
    navigate(`${searchRoute}?${params}`);
  };

  const handleSearchInPlatform = () => {
    const params = new URLSearchParams(queryParams);
    params.delete(SEARCH_SPACE_URL_PARAM);
    navigate(`${searchRoute}?${params}`);
  };

  const filters = useMemo(
    () => [...journeyFilter.value, ...contributionFilter.value, ...contributorFilter.value, ...calloutFilter.value],
    [journeyFilter, contributionFilter, contributorFilter, calloutFilter]
  );

  const { data: spaceIdData, loading: resolvingSpace } = useSpaceUrlResolverQuery({
    variables: { spaceNameId: spaceNameId! },
    skip: !spaceNameId,
  });
  const spaceId = spaceIdData?.lookupByName.space?.id;

  const { data, loading: isSearching } = useSearchQuery({
    variables: {
      searchData: {
        terms: termsFromUrl,
        tagsetNames,
        types: filters,
        searchInSpaceFilter: spaceId,
      },
    },
    fetchPolicy: 'no-cache',
    skip: termsFromUrl.length === 0 || resolvingSpace,
  });

  const results = termsFromUrl.length === 0 ? undefined : toResultType(data);

  const { journeyResultsCount, calloutResultsCount, contributorResultsCount, contributionResultsCount } =
    data?.search ?? {};

  const { spaceResults, calloutResults, contributionResults, contributorResults }: SearchViewSections = useMemo(
    () =>
      groupBy(results, ({ type }) => {
        return findKey(searchResultSectionTypes, types => types.includes(type));
      }),
    [results]
  );

  const { data: spaceDetails, loading } = useSearchScopeDetailsSpaceQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const convertedCalloutResults = calloutResults as SearchResultCalloutFragment[];

  return (
    <>
      <PageContentColumn columns={12}>
        <PageContentBlockSeamless disablePadding>
          <MultipleSelect size="small" onChange={handleTermsChange} value={searchTerms} minLength={2} autoFocus />
        </PageContentBlockSeamless>
        {spaceId && (
          <SearchResultsScope
            currentScope={
              <SearchResultsScopeCard
                avatar={spaceDetails?.lookup.space?.about.profile.avatar}
                iconComponent={SpaceIcon}
                loading={loading}
                onDelete={handleSearchInPlatform}
              >
                {spaceDetails?.lookup.space?.about.profile.displayName}
              </SearchResultsScopeCard>
            }
            alternativeScope={
              <SearchResultsScopeCard iconComponent={Logo} onClick={handleSearchInPlatform}>
                {t('components.searchScope.platform')}
              </SearchResultsScopeCard>
            }
          />
        )}
        {!isAuthenticated && (
          <Box display="flex" justifyContent="center" paddingBottom={2}>
            <Link href={buildLoginUrl()}>{t('pages.search.user-not-logged')}</Link>
          </Box>
        )}
        <SearchResultSection
          title={journeyFilterTitle}
          filterTitle={t('pages.search.filter.type.journey')}
          count={journeyResultsCount}
          filterConfig={journeyFilterConfig}
          results={spaceResults}
          currentFilter={journeyFilter}
          onFilterChange={setJourneyFilter}
          loading={isSearching}
          cardComponent={SearchResultPostChooser}
        />
        <SearchResultSection
          title={t('common.collaborationTools')}
          filterTitle={t('common.type')}
          count={calloutResultsCount}
          filterConfig={undefined /* TODO: Callout filtering disabled for now calloutFilterConfig */}
          results={convertedCalloutResults}
          currentFilter={calloutFilter}
          onFilterChange={setCalloutFilter}
          loading={isSearching}
          cardComponent={SearchResultsCalloutCard}
        />
        <SearchResultSection
          title={t('common.contributions')}
          filterTitle={t('pages.search.filter.type.contribution')}
          count={contributionResultsCount}
          filterConfig={contributionFilterConfig}
          results={contributionResults}
          currentFilter={contributionFilter}
          onFilterChange={setContributionFilter}
          loading={isSearching}
          cardComponent={SearchResultPostChooser}
        />
        <SearchResultSection
          title={t('common.contributors')}
          filterTitle={t('pages.search.filter.type.contributor')}
          count={contributorResultsCount}
          filterConfig={contributorFilterConfig}
          results={contributorResults}
          currentFilter={contributorFilter}
          onFilterChange={setContributorFilter}
          loading={isSearching}
          cardComponent={SearchResultPostChooser}
        />
      </PageContentColumn>
    </>
  );
};

export default SearchView;

const toResultType = (query?: SearchQuery): SearchResultMetaType[] => {
  if (!query) {
    return [];
  }

  const spaceResults = (query.search.journeyResults || [])
    .map<SearchResultMetaType>(
      ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const contributionResults = (query.search.contributionResults || [])
    .map<SearchResultMetaType>(
      ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const contributorResults = (query.search.contributorResults || [])
    .map<SearchResultMetaType>(
      ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const calloutResults = (query.search.calloutResults || []).map<SearchResultMetaType>(
    ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType),
    []
  );

  return calloutResults.concat(contributorResults).concat(spaceResults).concat(contributionResults);
};
