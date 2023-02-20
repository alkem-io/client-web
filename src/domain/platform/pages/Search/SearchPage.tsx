import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Box } from '@mui/material';
import Link from '@mui/material/Link';
import MultipleSelect from './MultipleSelect';
import { useUserContext } from '../../../community/contributor/user';
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
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../routes/constants';
import { AUTH_LOGIN_PATH } from '../../../../core/auth/authentication/constants/authentication.constants';
import { FilterConfig } from './Filter';
import SearchResultSection from './SearchResultSection';
import { escape } from 'lodash';
import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../../core/ui/grid/utils';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';

export const MAX_TERMS_SEARCH = 5;

const tagsetNames = ['skills', 'keywords'];
// todo translate
const contributorFilterConfig: FilterConfig = {
  all: {
    title: 'All',
    value: ['user', 'organization'],
    typename: 'all',
  },
  user: {
    title: 'Users only',
    value: ['user'],
    typename: 'User',
  },
  organization: {
    title: 'Organizations only',
    value: ['organization'],
    typename: 'Organization',
  },
};
// todo translate
const journeyFilterConfig: FilterConfig = {
  all: {
    title: 'All',
    value: ['hub', 'opportunity', 'challenge'],
    typename: 'all',
  },
  opportunity: {
    title: 'Opportunities only',
    value: ['opportunity'],
    typename: 'Opportunity',
  },
  challenge: {
    title: 'Challenges only',
    value: ['challenge'],
    typename: 'Challenge',
  },
  hub: {
    title: 'Hubs only',
    value: ['hub'],
    typename: 'Hub',
  },
};

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
  const breakpoint = useCurrentBreakpoint();

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get('terms');

  const termsFromUrl = useMemo(() => {
    const terms = (queryParam?.split(',') ?? []).map(escape) || [];
    if (terms.length > MAX_TERMS_SEARCH) {
      // If too many terms come in the url, return an array with the first 4 elements + a fith element containing the rest of the terms all together
      return [...terms.slice(0, MAX_TERMS_SEARCH - 1), terms.slice(MAX_TERMS_SEARCH - 1).join(' ')];
    }
    return terms;
  }, [queryParam]);
  const [termsFromQuery, setTermsFromQuery] = useState<string[] | undefined>(undefined);

  const [results, setResults] = useState<SearchResultMetaType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  // todo only the value can be used instead
  const [contributorFilterValue, setContributorFilterValue] = useState<string[]>(contributorFilterConfig.all.value);
  const [entityFilterValue, setEntityFilterValue] = useState<string[]>(journeyFilterConfig.all.value);

  useEffect(() => {
    setTermsFromQuery(termsFromUrl);
    setSearchTerms(termsFromUrl);
  }, [termsFromUrl, setTermsFromQuery, setSearchTerms]);

  const resetState = () => {
    setContributorFilterValue(contributorFilterConfig.all.value);
    setEntityFilterValue(journeyFilterConfig.all.value);
    setSearchTerms([]);
    setResults(undefined);
  };

  const handleTermChange = (newValue: string[]) => {
    const newTerms = newValue.filter(term => term) ?? [];
    setSearchTerms(newTerms);

    // avoid sending unnecessary query
    if (!newValue.length) {
      resetState();
    } else {
      const terms = newTerms.join(',');
      const params = new URLSearchParams({ [SEARCH_TERMS_PARAM]: terms });
      navigate(`${SEARCH_ROUTE}?${params}`);
      searchQuery(newTerms, [...contributorFilterValue, ...entityFilterValue]);
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

    searchQuery(termsFromQuery ?? [], [...contributorFilterValue, ...entityFilterValue]);
  }, [searchQuery, termsFromQuery, contributorFilterValue, entityFilterValue]);

  useEffect(() => {
    if (!searchTerms.length) {
      return;
    }

    searchQuery(searchTerms, [...contributorFilterValue, ...entityFilterValue]);
  }, [searchQuery, searchTerms, contributorFilterValue, entityFilterValue]);

  const handleContributorFilterChange = (value: string[]) => setContributorFilterValue(value);
  const handleEntityFilterChange = (value: string[]) => setEntityFilterValue(value);

  const [journeyResults, contributorResults] = useMemo(
    () => [
      results?.filter(
        ({ type }) =>
          type === SearchResultType.Hub || type === SearchResultType.Challenge || type === SearchResultType.Opportunity
      ),
      results?.filter(({ type }) => type === SearchResultType.User || type === SearchResultType.Organization),
    ],
    [results]
  );

  const suggestions = t('pages.search.suggestions-array', { returnObjects: true });

  return (
    <TopLevelDesktopLayout>
      <Box marginTop={gutters(0.5)} marginX="auto" display={breakpoint === 'xs' ? 'none' : 'block'}>
        <MultipleSelect
          onChange={handleTermChange}
          defaultValue={termsFromQuery}
          elements={suggestions}
          allowUnknownValues
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
          filterConfig={journeyFilterConfig}
          results={journeyResults}
          onFilterChange={handleEntityFilterChange}
          loading={isSearching}
        />
        <SearchResultSection
          filterConfig={contributorFilterConfig}
          title={t('common.contributors')}
          results={contributorResults}
          onFilterChange={handleContributorFilterChange}
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

  const contributorResults = (query.search.contributorResults || [])
    .map<SearchResultMetaType>(
      ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

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

  return contributorResults.concat(journeyResults).concat(contributionResults);
};
