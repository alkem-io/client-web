import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Box, Grid, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import HelpOutline from '@mui/icons-material/HelpOutline';
import MultipleSelect, { MultiSelectElement } from '../../../../common/components/core/MultipleSelect';
import { SubHeader } from '../../../../common/components/core/Section';
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
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../../../core/routing/route.constants';
import { AUTH_LOGIN_PATH } from '../../../../core/auth/authentication/constants/authentication.constants';
import tags from './searchTagsList';
import { FilterConfig } from './Filter';
import SearchResultSection from './SearchResultSection';
import { escape } from 'lodash';
import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';

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

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get('terms');

  const termsFromUrl = useMemo(
    () => (queryParam?.split(',') ?? []).map(escape).map(x => ({ id: x, name: x })) || [],
    [queryParam]
  );
  const [termsFromQuery, setTermsFromQuery] = useState<MultiSelectElement[] | undefined>(undefined);

  const [results, setResults] = useState<SearchResultMetaType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  // todo only the value can be used instead
  const [contributorFilterValue, setContributorFilterValue] = useState<string[]>(contributorFilterConfig.all.value);
  const [entityFilterValue, setEntityFilterValue] = useState<string[]>(journeyFilterConfig.all.value);

  useEffect(() => {
    setTermsFromQuery(termsFromUrl);
    setSearchTerms(termsFromUrl.map(x => x.name));
  }, [termsFromUrl, setTermsFromQuery, setSearchTerms]);

  const resetState = () => {
    setContributorFilterValue(contributorFilterConfig.all.value);
    setEntityFilterValue(journeyFilterConfig.all.value);
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
      results?.filter(
        ({ type }) =>
          type === SearchResultType.Hub || type === SearchResultType.Challenge || type === SearchResultType.Opportunity
      ),
      results?.filter(({ type }) => type === SearchResultType.User || type === SearchResultType.Organization),
    ],
    [results]
  );

  return (
    <TopLevelDesktopLayout>
      <PageContentColumn columns={12}>
        <Grid container padding={{ xs: 0, sm: 2, md: 8 }}>
          <Grid
            item
            textAlign={'center'}
            marginBottom={4}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'middle'}
            xs={12}
            md={4}
          >
            <HelpOutline color="primary" sx={{ fontSize: { xs: 80, sm: 100, md: 130 } }} />
          </Grid>
          <Grid
            item
            sx={{ display: 'table-cell', verticalAlign: 'middle', textAlign: { xs: 'center', md: 'left' } }}
            marginBottom={2}
            xs={12}
            md={8}
          >
            <Typography variant={'h2'} sx={{ textTransform: 'uppercase' }}>
              {t('pages.search.header')}
            </Typography>
            <SubHeader text={t('pages.search.alternativesubheader')} />
          </Grid>
          <Grid item xs={12}>
            <MultipleSelect
              onChange={handleTermChange}
              defaultValue={termsFromQuery}
              elements={tags}
              allowUnknownValues
              minLength={2}
            />
          </Grid>
        </Grid>
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
