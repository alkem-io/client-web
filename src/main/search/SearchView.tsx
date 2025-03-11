import { useMemo, useState, useEffect, ReactNode, useCallback, PropsWithChildren } from 'react';

import { Box, Link } from '@mui/material';
import { findKey, groupBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { HubOutlined, DrawOutlined, GroupOutlined, LibraryBooksOutlined } from '@mui/icons-material';

import Gutters from '@/core/ui/grid/Gutters';
import {
  useSearchQuery,
  useSpaceUrlResolverQuery,
  useSearchScopeDetailsSpaceQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import {
  SearchQuery,
  SearchResult,
  SearchCategory,
  SearchResultType,
  SearchResultPostFragment,
  SearchResultUserFragment,
  SearchResultSpaceFragment,
  SearchResultCalloutFragment,
  SearchResultOrganizationFragment,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useUserContext } from '@/domain/community/user';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import SearchResultsScope from '@/core/ui/search/SearchResultsScope';
import { useMemoizedQueryParams } from '@/core/routing/useQueryParams';
import SearchResultsScopeCard from '@/core/ui/search/SearchResultsScopeCard';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';

import {
  FilterConfig,
  FilterDefinition,
  calloutFilterConfig,
  contributorFilterConfig,
  contributionFilterConfig,
} from './Filter';
import SearchResultSection from './SearchResultSection';
import SearchResultPostChooser from './searchResults/SearchResultPostChooser';
import SearchResultsCalloutCard from './searchResults/searchResultsCallout/SearchResultsCalloutCard';

import { useSearchTerms } from './useSearchTerms';
import { buildLoginUrl } from '../routing/urlBuilders';
import AlkemioLogo from '../ui/logo/logoSmall.svg?react';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from './constants';

const SEARCH_RESULTS_COUNT = 5;
export const MAX_TERMS_SEARCH = 5;

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
  const [journeyFilter, setJourneyFilter] = useState<FilterDefinition>(journeyFilterConfig.all);
  const [calloutFilter, setCalloutFilter] = useState<FilterDefinition>(calloutFilterConfig.all);
  const [contributorFilter, setContributorFilter] = useState<FilterDefinition>(contributorFilterConfig.all);
  const [contributionFilter, setContributionFilter] = useState<FilterDefinition>(contributionFilterConfig.all);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const termsFromUrl = useSearchTerms();

  const queryParams = useMemoizedQueryParams();

  const { isAuthenticated } = useUserContext();

  const spaceNameId = queryParams[SEARCH_SPACE_URL_PARAM]?.[0] ?? undefined;
  console.log('spaceNameId', spaceNameId);

  const handleTermsChange = useCallback(
    (newValue: string[]) => {
      const params = new URLSearchParams(
        Object.entries(queryParams).flatMap(([key, values]) => values.map(value => [key, value]))
      );

      params.delete(SEARCH_TERMS_URL_PARAM);

      for (const term of newValue) {
        params.append(SEARCH_TERMS_URL_PARAM, term);
      }

      if (newValue.length === 0) {
        params.append(SEARCH_TERMS_URL_PARAM, '');
      }

      navigate(`${searchRoute}?${params}`);
    },
    [searchRoute, queryParams, navigate]
  );

  const handleSearchInPlatform = useCallback(() => {
    const params = new URLSearchParams(
      Object.entries(queryParams).flatMap(([key, values]) => values.map(value => [key, value]))
    );

    params.delete(SEARCH_SPACE_URL_PARAM);

    navigate(`${searchRoute}?${params}`);
  }, [searchRoute, queryParams, navigate]);

  const { data: spaceIdData, loading: resolvingSpace } = useSpaceUrlResolverQuery({
    variables: { spaceNameId: spaceNameId! },
    skip: !spaceNameId,
  });
  console.log('spaceIdData', spaceIdData);

  const spaceId = spaceIdData?.lookupByName.space?.id;
  console.log('spaceId', spaceId);

  const memoizedSearchFilters = useMemo(
    () => [
      {
        category: SearchCategory.Spaces,
        size: SEARCH_RESULTS_COUNT,
        types: journeyFilter.value,
        // cursor: data?.search?.spaceResults?.cursor,
        cursor: undefined,
      },
      {
        category: SearchCategory.CollaborationTools,
        size: SEARCH_RESULTS_COUNT,
        // cursor: data?.search?.calloutResults?.cursor,
        cursor: undefined,
      },
      {
        category: SearchCategory.Responses,
        size: SEARCH_RESULTS_COUNT,
        types: contributionFilter.value,
        // cursor: data?.search?.contributionResults?.cursor,
        cursor: undefined,
      },
      {
        category: SearchCategory.Contributors,
        size: SEARCH_RESULTS_COUNT,
        types: contributorFilter.value,
        // cursor: data?.search?.contributorResults?.cursor,
        cursor: undefined,
      },
    ],
    [journeyFilter, contributionFilter, contributorFilter]
  );

  const hasNoTermsLength = termsFromUrl.length === 0;

  const { data, loading: isSearching } = useSearchQuery({
    variables: {
      searchData: {
        terms: termsFromUrl,
        searchInSpaceFilter: spaceId,
        filters: memoizedSearchFilters,
        tagsetNames: ['skills', 'keywords'],
      },
    },
    fetchPolicy: 'no-cache',
    skip: hasNoTermsLength || resolvingSpace,
  });

  const results = hasNoTermsLength ? undefined : toResultType(data);

  const { spaceResults, calloutResults, contributionResults, contributorResults }: SearchViewSections = useMemo(
    () => groupBy(results, ({ type }) => findKey(searchResultSectionTypes, types => types.includes(type))),
    [results]
  );
  console.log('spaceResults >>>', spaceResults);

  const { data: spaceDetails, loading } = useSearchScopeDetailsSpaceQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  useEffect(() => {
    if (hasNoTermsLength) {
      setJourneyFilter(journeyFilterConfig.all);
      setContributionFilter(contributionFilterConfig.all);
      setContributorFilter(contributorFilterConfig.all);
    }
  }, [hasNoTermsLength]);

  const convertedCalloutResults = calloutResults as SearchResultCalloutFragment[];

  return (
    <>
      <PageContentColumn columns={12}>
        <PageContentBlockSeamless disablePadding>
          <MultipleSelect size="small" onChange={handleTermsChange} value={termsFromUrl} minLength={2} autoFocus />
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

        {/* ⬇️⬇️⬇️⬇️⬇️⬇️⬇️ */}
        <Gutters disablePadding sx={{ width: '100%', flexDirection: 'row' }}>
          <FiltersDescriptionBlock />

          <Gutters disablePadding sx={{ width: '100%', flexDirection: 'column' }}>
            <SectionWrapper>
              <SearchResultSection
                title={journeyFilterTitle}
                filterTitle={t('pages.search.filter.type.journey')}
                count={data?.search?.spaceResults?.total ?? 0}
                filterConfig={journeyFilterConfig}
                results={spaceResults}
                currentFilter={journeyFilter}
                onFilterChange={setJourneyFilter}
                loading={isSearching}
                cardComponent={SearchResultPostChooser}
              />
            </SectionWrapper>

            <SectionWrapper>
              <SearchResultSection
                title={t('common.collaborationTools')}
                filterTitle={t('common.type')}
                count={data?.search?.calloutResults?.total ?? 0}
                filterConfig={undefined /* TODO: Callout filtering disabled for now calloutFilterConfig */}
                results={convertedCalloutResults}
                currentFilter={calloutFilter}
                onFilterChange={setCalloutFilter}
                loading={isSearching}
                cardComponent={SearchResultsCalloutCard}
              />
            </SectionWrapper>

            <SectionWrapper>
              <SearchResultSection
                title={t('common.contributions')}
                filterTitle={t('pages.search.filter.type.contribution')}
                count={data?.search?.contributionResults?.total ?? 0}
                filterConfig={contributionFilterConfig}
                results={contributionResults}
                currentFilter={contributionFilter}
                onFilterChange={setContributionFilter}
                loading={isSearching}
                cardComponent={SearchResultPostChooser}
              />
            </SectionWrapper>

            <SectionWrapper>
              <SearchResultSection
                title={t('common.contributors')}
                filterTitle={t('pages.search.filter.type.contributor')}
                count={data?.search?.contributorResults?.total ?? 0}
                filterConfig={contributorFilterConfig}
                results={contributorResults}
                currentFilter={contributorFilter}
                onFilterChange={setContributorFilter}
                loading={isSearching}
                cardComponent={SearchResultPostChooser}
              />
            </SectionWrapper>
          </Gutters>
        </Gutters>
        {/* ⬆️⬆️⬆️⬆️⬆️⬆️⬆️ */}
      </PageContentColumn>
    </>
  );
};

export default SearchView;

function toResultType(query?: SearchQuery): SearchResultMetaType[] {
  if (!query) {
    return [];
  }

  const spaceResults = (query.search.spaceResults?.results || [])
    .map<SearchResultMetaType>(
      ({ id, type, score, terms, ...rest }) =>
        ({ id, type, ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType)
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const contributionResults = (query.search.contributionResults?.results || [])
    .map<SearchResultMetaType>(
      ({ id, type, score, terms, ...rest }) =>
        ({ id, type, ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType)
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const contributorResults = (query.search.contributorResults?.results || [])
    .map<SearchResultMetaType>(
      ({ id, type, score, terms, ...rest }) =>
        ({ id, type, ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType)
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const calloutResults = (query.search.calloutResults?.results || [])
    .map<SearchResultMetaType>(
      ({ id, type, score, terms, ...rest }) =>
        ({ id, type, ...rest, score: score || 0, terms: terms || [] } as SearchResultMetaType)
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));

  return [...spaceResults, ...contributionResults, ...contributorResults, ...calloutResults];
}

function SectionWrapper({ children }: PropsWithChildren) {
  return <Box sx={{ display: 'flex', flexDirection: 'row', gap: gutters(1) }}>{children}</Box>;
}

function FiltersDescriptionBlock() {
  const { t } = useTranslation();

  return (
    <Gutters
      disableGap
      disablePadding
      sx={theme => ({
        minWidth: 250,
        borderRadius: 1,
        height: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <FiltersDescriptionBlockItem>
        <HubOutlined />
        <Caption>{t('components.searchDialog.spacesAndSubspaces')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem>
        <DrawOutlined />
        <Caption>{t('components.searchDialog.collaborationTools')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem>
        <LibraryBooksOutlined />
        <Caption>{t('components.searchDialog.responses')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem>
        <GroupOutlined />
        <Caption>{t('components.searchDialog.contributors')}</Caption>
      </FiltersDescriptionBlockItem>
    </Gutters>
  );
}

function FiltersDescriptionBlockItem({ children }: PropsWithChildren) {
  return <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}>{children}</Gutters>;
}
