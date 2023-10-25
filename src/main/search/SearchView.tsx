import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchQuery, useSearchScopeDetailsSpaceQuery } from '../../core/apollo/generated/apollo-hooks';
import {
  SearchQuery,
  SearchResult,
  SearchResultChallengeFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
} from '../../core/apollo/generated/graphql-schema';
import PageContentColumn from '../../core/ui/content/PageContentColumn';
import { useUserContext } from '../../domain/community/user';
import {
  contributionFilterConfig,
  contributorFilterConfig,
  FilterConfig,
  FilterDefinition,
} from '../../domain/platform/search/Filter';
import MultipleSelect from '../../core/ui/search/MultipleSelect';
import SearchResultSection from '../../domain/platform/search/SearchResultSection';
import { useQueryParams } from '../../core/routing/useQueryParams';
import { buildLoginUrl } from '../routing/urlBuilders';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from './constants';
import PageContentBlockSeamless from '../../core/ui/content/PageContentBlockSeamless';
import SearchResultsScope from '../../core/ui/search/SearchResultsScope';
import SearchResultsScopeCard from '../../core/ui/search/SearchResultsScopeCard';
import { ReactComponent as AlkemioLogo } from '../ui/logo/logoSmall.svg';
import { SpaceIcon } from '../../domain/journey/space/icon/SpaceIcon';

export const MAX_TERMS_SEARCH = 5;

const tagsetNames = ['skills', 'keywords'];

export type SearchResultT<T> = T & SearchResult;

export type SearchResultMetaType = SearchResultT<
  | SearchResultUserFragment
  | SearchResultOrganizationFragment
  | SearchResultPostFragment
  | SearchResultSpaceFragment
  | SearchResultChallengeFragment
  | SearchResultOpportunityFragment
>;

interface SearchViewProps {
  searchRoute: string;
  journeyFilterConfig: FilterConfig;
  journeyFilterTitle: ReactNode;
}

const Logo = () => <AlkemioLogo />;

const SearchView = ({ searchRoute, journeyFilterConfig, journeyFilterTitle }: SearchViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();

  const queryParams = useQueryParams();

  const spaceNameId = queryParams.get(SEARCH_SPACE_URL_PARAM) ?? undefined;

  const termsFromUrl = useMemo(() => {
    const terms = queryParams.getAll(SEARCH_TERMS_URL_PARAM); // TODO escape if needed
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
    navigate(`${searchRoute}?${params}`);
  };

  const handleSearchInPlatform = () => {
    const params = new URLSearchParams(queryParams);
    params.delete(SEARCH_SPACE_URL_PARAM);
    navigate(`${searchRoute}?${params}`);
  };

  const filters = useMemo(
    () => [...journeyFilter.value, ...contributionFilter.value, ...contributorFilter.value],
    [journeyFilter, contributionFilter, contributorFilter]
  );

  const { data, loading: isSearching } = useSearchQuery({
    variables: {
      searchData: {
        terms: termsFromUrl,
        tagsetNames,
        typesFilter: filters,
        searchInSpaceFilter: spaceNameId,
      },
    },
    fetchPolicy: 'no-cache',
    skip: termsFromUrl.length === 0,
  });

  const results = termsFromUrl.length === 0 ? undefined : toResultType(data);

  const { journeyResultsCount, contributorResultsCount, contributionResultsCount } = data?.search ?? {};

  const [journeyResults, contributionResults, contributorResults] = useMemo(
    () => [
      results?.filter(
        ({ type }) =>
          type === SearchResultType.Space ||
          type === SearchResultType.Challenge ||
          type === SearchResultType.Opportunity
      ),
      results?.filter(
        ({ type }) =>
          type ===
          SearchResultType.Post /*|| type === SearchResultType.Whiteboard || type === SearchResultType.Callout*/
      ),
      results?.filter(({ type }) => type === SearchResultType.User || type === SearchResultType.Organization),
    ],
    [results]
  );

  const { data: spaceDetails, loading } = useSearchScopeDetailsSpaceQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  return (
    <>
      <PageContentColumn columns={12}>
        <PageContentBlockSeamless disablePadding>
          <MultipleSelect size="small" onChange={handleTermsChange} value={searchTerms} minLength={2} autoFocus />
        </PageContentBlockSeamless>
        {spaceNameId && (
          <SearchResultsScope
            currentScope={
              <SearchResultsScopeCard
                avatar={spaceDetails?.space.profile.avatar}
                iconComponent={SpaceIcon}
                loading={loading}
                onDelete={handleSearchInPlatform}
              >
                {spaceDetails?.space.profile.displayName}
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
          results={journeyResults}
          currentFilter={journeyFilter}
          onFilterChange={setJourneyFilter}
          loading={isSearching}
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

  const journeyResults = (query.search.journeyResults || [])
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

  return contributorResults.concat(journeyResults).concat(contributionResults);
};
