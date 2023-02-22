import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { escape } from 'lodash';
import { useLocation, useNavigate } from 'react-router';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { useSearchLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  SearchQuery,
  SearchResult,
  SearchResultChallengeFragment,
  SearchResultHubFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultType,
  SearchResultUserFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { AUTH_LOGIN_PATH } from '../../../../core/auth/authentication/constants/authentication.constants';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../../core/ui/grid/utils';
import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';
import { useUserContext } from '../../../community/contributor/user';
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../routes/constants';
import { contributionFilterConfig, contributorFilterConfig, FilterDefinition, journeyFilterConfig } from './Filter';
import MultipleSelect from './MultipleSelect';
import SearchResultSection from './SearchResultSection';

export const MAX_TERMS_SEARCH = 5;

const tagsetNames = ['skills', 'keywords'];

export type SearchResultT<T> = T & SearchResult;

export type SearchResultMetaType = SearchResultT<
  | SearchResultUserFragment
  | SearchResultOrganizationFragment
  | SearchResultHubFragment
  | SearchResultChallengeFragment
  | SearchResultOpportunityFragment
>;

const SearchPage: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get('terms');

  const termsFromUrl = useMemo(() => {
    const terms = (queryParam?.split(',') ?? []).map(term => term.trim()).map(escape) || [];
    if (terms.length > MAX_TERMS_SEARCH) {
      // If too many terms come in the url, return an array with the first 4 elements + a fith element containing the rest of the terms all together
      return [...terms.slice(0, MAX_TERMS_SEARCH - 1), terms.slice(MAX_TERMS_SEARCH - 1).join(' ')];
    }
    return terms;
  }, [queryParam]);
  const [termsFromQuery, setTermsFromQuery] = useState<string[] | undefined>(undefined);

  const [results, setResults] = useState<SearchResultMetaType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const [journeyFilter, setJourneyFilter] = useState<FilterDefinition>(journeyFilterConfig.all);
  const [contributionFilter, setContributionFilter] = useState<FilterDefinition>(contributionFilterConfig.all);
  const [contributorFilter, setContributorFilter] = useState<FilterDefinition>(contributorFilterConfig.all);

  useEffect(() => {
    setTermsFromQuery(termsFromUrl);
    setSearchTerms(termsFromUrl);
  }, [termsFromUrl, setTermsFromQuery, setSearchTerms]);

  const resetState = () => {
    setJourneyFilter(journeyFilterConfig.all);
    setContributionFilter(contributionFilterConfig.all);
    setContributorFilter(contributorFilterConfig.all);
    setSearchTerms([]);
    setResults(undefined);
  };

  const handleTermsChange = (newValue: string[]) => {
    const newTerms = newValue.filter(term => term) ?? [];
    setSearchTerms(newTerms);

    // avoid sending unnecessary query
    if (!newValue.length) {
      resetState();
    } else {
      const terms = newTerms.join(',');
      const params = new URLSearchParams({ [SEARCH_TERMS_PARAM]: terms });
      navigate(`${SEARCH_ROUTE}?${params}`);
      searchQuery(newTerms, [...contributorFilter.value, ...journeyFilter.value]);
    }
  };

  const [search, { loading: isSearching }] = useSearchLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      const updatedResult = toResultType(data);
      setResults(updatedResult);
    },
  });

  const searchQuery = useCallback(
    (terms: string[], filters: string[]) => {
      search({
        variables: {
          searchData: {
            terms,
            tagsetNames,
            typesFilter: filters,
          },
        },
      });
    },
    [search]
  );

  useEffect(() => {
    if (!termsFromQuery || !termsFromQuery.length) {
      return;
    }

    searchQuery(termsFromQuery ?? [], [...contributorFilter.value, ...journeyFilter.value]);
  }, [searchQuery, termsFromQuery, contributorFilter, journeyFilter]);

  useEffect(() => {
    if (!searchTerms.length) {
      return;
    }

    searchQuery(searchTerms, [...contributorFilter.value, ...journeyFilter.value]);
  }, [searchQuery, searchTerms, contributorFilter, journeyFilter]);

  const [journeyResults, contributionResults, contributorResults] = useMemo(
    () => [
      results?.filter(
        ({ type }) =>
          type === SearchResultType.Hub || type === SearchResultType.Challenge || type === SearchResultType.Opportunity
      ),
      results?.filter(
        ({ type }) =>
          type ===
          SearchResultType.Card /*|| type === SearchResultType.Whiteboard || type === SearchResultType.Callout*/
      ),
      results?.filter(({ type }) => type === SearchResultType.User || type === SearchResultType.Organization),
    ],
    [results]
  );

  const suggestions = t('pages.search.suggestions-array', { returnObjects: true });

  return (
    <TopLevelDesktopLayout>
      <Box marginTop={gutters(0.5)} marginX="auto" minWidth="75%">
        <MultipleSelect
          onChange={handleTermsChange}
          selectedTerms={searchTerms}
          suggestions={suggestions}
          minLength={2}
          disabled={isSearching}
        />
      </Box>
      <PageContentColumn columns={12}>
        {!isAuthenticated && (
          <Box display="flex" justifyContent="center" paddingBottom={2}>
            <Link component={RouterLink} to={AUTH_LOGIN_PATH}>
              {t('pages.search.user-not-logged')}
            </Link>
          </Box>
        )}
        <SearchResultSection
          title={`${t('common.hubs')}, ${t('common.challenges')} & ${t('common.opportunities')}`}
          filterTitle={t('pages.search.filter.type.journey')}
          filterConfig={journeyFilterConfig}
          results={journeyResults}
          currentFilter={journeyFilter}
          onFilterChange={setJourneyFilter}
          loading={isSearching}
        />
        <SearchResultSection
          title={t('common.contributions')}
          filterTitle={t('pages.search.filter.type.contribution')}
          filterConfig={contributionFilterConfig}
          results={contributionResults}
          currentFilter={contributionFilter}
          onFilterChange={setContributionFilter}
          loading={isSearching}
        />
        <SearchResultSection
          title={t('common.contributors')}
          filterTitle={t('pages.search.filter.type.contributor')}
          filterConfig={contributorFilterConfig}
          results={contributorResults}
          currentFilter={contributorFilter}
          onFilterChange={setContributorFilter}
          loading={isSearching}
        />
      </PageContentColumn>
    </TopLevelDesktopLayout>
  );
};

export { SearchPage };

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
