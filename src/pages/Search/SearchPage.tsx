import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Box } from '@mui/material';
import Link from '@mui/material/Link';
import HelpOutline from '@mui/icons-material/HelpOutline';
import MultipleSelect, { MultiSelectElement } from '../../common/components/core/MultipleSelect';
import Section, { Header as SectionHeader, SubHeader } from '../../common/components/core/Section';
import { useApolloErrorHandler, useUpdateNavigation, useUserContext } from '../../hooks';
import { useSearchLazyQuery } from '../../hooks/generated/graphql';
import {
  ChallengeSearchResultFragment,
  HubSearchResultFragment,
  OpportunitySearchResultFragment,
  OrganizationSearchResultFragment,
  SearchQuery,
  UserSearchResultFragment,
} from '../../models/graphql-schema';
import { PageProps } from '../common';
import { RouterLink } from '../../common/components/core/RouterLink';
import { AUTH_LOGIN_PATH } from '../../models/constants';
import SectionSpacer from '../../domain/shared/components/Section/SectionSpacer';
import tags from './searchTagsList';
import { FilterConfig } from './Filter';
import SearchResultSection from './SearchResultSection';

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
const entityFilterConfig: FilterConfig = {
  all: {
    title: 'All',
    value: ['opportunity', 'challenge'],
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
};

export type ResultMetadataType = { score: number; terms: string[] };
export type SearchResult<T> = T & ResultMetadataType;

export type ResultType = SearchResult<
  UserSearchResultFragment
  | OrganizationSearchResultFragment
  | HubSearchResultFragment
  | ChallengeSearchResultFragment
  | OpportunitySearchResultFragment
>;

const SearchPage: FC<PageProps> = ({ paths }): React.ReactElement => {
  const handleError = useApolloErrorHandler();
  useUpdateNavigation({ currentPaths: paths });

  const { t } = useTranslation();
  const { isAuthenticated } = useUserContext();

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get('terms');

  const termsFromUrl = useMemo(() => (queryParam?.split(',') ?? []).map(x => ({ id: x, name: x })) || [], [queryParam]);
  const [termsFromQuery, setTermsFromQuery] = useState<MultiSelectElement[] | undefined>(undefined);

  const [results, setResults] = useState<ResultType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  // todo only the value can be used instead
  const [contributorFilterValue, setContributorFilterValue] = useState<string[]>(contributorFilterConfig.all.value);
  const [entityFilterValue, setEntityFilterValue] = useState<string[]>(entityFilterConfig.all.value);

  useEffect(() => {
    setTermsFromQuery(termsFromUrl);
    setSearchTerms(termsFromUrl.map(x => x.name));
  }, [termsFromUrl, setTermsFromQuery, setSearchTerms]);

  const resetState = () => {
    setContributorFilterValue(contributorFilterConfig.all.value);
    setEntityFilterValue(entityFilterConfig.all.value);
    setSearchTerms([]);
    setResults(undefined);
  };

  const handleTermChange = (newValue: MultiSelectElement[]) => {
    const newTerms = newValue.map(x => x.name);
    setSearchTerms(newTerms);

    // avoid sending unnecessary query
    if (!newValue.length) {
      resetState();
    } else {
      searchQuery(newTerms, [...contributorFilterValue, ...entityFilterValue]);
    }
  };

  const [search, { loading: isSearching }] = useSearchLazyQuery({
    fetchPolicy: 'no-cache',
    onError: handleError,
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

    searchQuery(termsFromQuery?.map(x => x.name) || [], [...contributorFilterValue, ...entityFilterValue]);
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
      results?.filter(({ __typename }) => __typename === 'Hub' || __typename === 'Challenge' || __typename === 'Opportunity'),
      results?.filter(({ __typename }) => __typename === 'User' || __typename === 'Organization'),
    ],
    [results]
  );

  return (
    <>
      <Section hideDetails avatar={<HelpOutline color="primary" sx={{ fontSize: 120 }} />}>
        <SectionHeader text={t('pages.search.header')} />
        <Box marginBottom={2}>
          <SubHeader text={t('pages.search.alternativesubheader')} />
        </Box>
        <MultipleSelect
          label={'search for skills'}
          onChange={handleTermChange}
          defaultValue={termsFromQuery}
          elements={tags}
          allowUnknownValues
        />
      </Section>
      {!isAuthenticated && (
        <Box display="flex" justifyContent="center" paddingBottom={2}>
          <Link component={RouterLink} to={AUTH_LOGIN_PATH}>
            {t('pages.search.user-not-logged')}
          </Link>
        </Box>
      )}
      <SearchResultSection
        title={`${t('common.hubs')}, ${t('common.challenges')} & ${t('common.opportunities')}`}
        filterConfig={entityFilterConfig}
        results={journeyResults}
        onFilterChange={handleEntityFilterChange}
        loading={isSearching}
      />
      <SectionSpacer double />
      <SearchResultSection
        filterConfig={contributorFilterConfig}
        title={t('common.contributors')}
        results={contributorResults}
        onFilterChange={handleContributorFilterChange}
        loading={isSearching}
      />
    </>
  );
};

export { SearchPage };

const toResultType = (query?: SearchQuery): ResultType[] => {
  if (!query) {
    return [];
  }

  return (query.search || [])
    .map<ResultType>(
      ({ result, score, terms }) => ({ ...result, score: score || 0, terms: terms || [] } as ResultType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));
};
