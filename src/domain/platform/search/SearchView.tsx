import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchQuery } from '../../../core/apollo/generated/apollo-hooks';
import {
  SearchQuery,
  SearchResult,
  SearchResultPostFragment,
  SearchResultChallengeFragment,
  SearchResultSpaceFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultType,
  SearchResultUserFragment,
} from '../../../core/apollo/generated/graphql-schema';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { useUserContext } from '../../community/contributor/user';
import { SEARCH_TERMS_PARAM } from '../routes/constants';
import { contributionFilterConfig, contributorFilterConfig, FilterConfig, FilterDefinition } from './Filter';
import MultipleSelect from '../../../core/ui/search/MultipleSelect';
import SearchResultSection from './SearchResultSection';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import GridItem from '../../../core/ui/grid/GridItem';
import SearchSuggestions from './SearchSuggestions';
import { buildLoginUrl } from '../../../main/routing/urlBuilders';

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
  spaceId?: string;
  journeyFilterConfig: FilterConfig;
  journeyFilterTitle: ReactNode;
}

const SearchView = ({ searchRoute, journeyFilterConfig, journeyFilterTitle, spaceId }: SearchViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();

  const queryParams = useQueryParams();

  const termsFromUrl = useMemo(() => {
    const terms = queryParams.getAll('terms'); // TODO escape if needed
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
    const params = new URLSearchParams();
    for (const term of newValue) {
      params.append(SEARCH_TERMS_PARAM, term);
    }
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
        searchInSpaceFilter: spaceId,
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

  const suggestions = t('pages.search.suggestions-array', { returnObjects: true });

  const handleSelectSuggestion = (suggestion: string) => handleTermsChange([...searchTerms, suggestion]);

  return (
    <>
      <GridItem columns={6}>
        <Box marginX="auto">
          <MultipleSelect onChange={handleTermsChange} value={searchTerms} minLength={2} autoFocus>
            <SearchSuggestions value={searchTerms} options={suggestions} onSelect={handleSelectSuggestion} />
          </MultipleSelect>
        </Box>
      </GridItem>
      <PageContentColumn columns={12}>
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
