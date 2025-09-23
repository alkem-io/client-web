import { useMemo, useState, useEffect, ReactNode, useCallback, PropsWithChildren } from 'react';

import { Box, Link } from '@mui/material';
import { findKey, groupBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { NetworkStatus } from '@apollo/client';
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
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
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
  spaceFilterConfig: FilterConfig;
  spaceFilterTitle: ReactNode;
}

interface SearchViewSections {
  spaceResults?: SearchResultMetaType[];
  calloutResults?: SearchResultMetaType[];
  contributionResults?: SearchResultMetaType[];
  contributorResults?: SearchResultMetaType[];
}

type ResultsCursors = {
  spaceCursor: string | undefined;
  collaborationCursor: string | undefined;
  contributionCursor: string | undefined;
  contributorCursor: string | undefined;
};

const searchResultSectionTypes: Record<keyof SearchViewSections, SearchResultType[]> = {
  spaceResults: [SearchResultType.Space, SearchResultType.Subspace],
  calloutResults: [SearchResultType.Callout],
  contributionResults: [SearchResultType.Post],
  contributorResults: [SearchResultType.User, SearchResultType.Organization],
};

const SEARCH_RESULTS_COUNT = 4;
export const MAX_TERMS_SEARCH = 5;
const tagsetNames = ['skills', 'keywords'];

const Logo = () => <AlkemioLogo />;

const SearchView = ({ searchRoute, spaceFilterConfig, spaceFilterTitle }: SearchViewProps) => {
  const [canSpaceLoadMore, setCanSpaceLoadMore] = useState(true);
  const [canCalloutLoadMore, setCalloutCanLoadMore] = useState(true);
  const [canContributorLoadMore, setContributorCanLoadMore] = useState(true);
  const [canContributionLoadMore, setCanContributionLoadMore] = useState(true);

  const [resultsCursors, setResultsCursors] = useState<ResultsCursors>({
    spaceCursor: undefined,
    contributorCursor: undefined,
    contributionCursor: undefined,
    collaborationCursor: undefined,
  });
  const [spaceFilter, setSpaceFilter] = useState<FilterDefinition>(spaceFilterConfig.all);
  const [calloutFilter, setCalloutFilter] = useState<FilterDefinition>(calloutFilterConfig.all);
  const [contributorFilter, setContributorFilter] = useState<FilterDefinition>(contributorFilterConfig.all);
  const [contributionFilter, setContributionFilter] = useState<FilterDefinition>(contributionFilterConfig.all);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const termsFromUrl = useSearchTerms();

  const queryParams = useMemoizedQueryParams();

  const { isAuthenticated } = useCurrentUserContext();

  const spaceNameId = queryParams[SEARCH_SPACE_URL_PARAM]?.[0] ?? undefined;

  const handleTermsChange = useCallback(
    (newValue: string[]) => {
      setCalloutCanLoadMore(true);
      setCanSpaceLoadMore(true);
      setContributorCanLoadMore(true);
      setCanContributionLoadMore(true);

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

  const spaceId = spaceIdData?.lookupByName.space?.id;

  const hasNoTermsLength = termsFromUrl.length === 0;

  const {
    data,
    networkStatus,
    loading: isSearching,
    fetchMore,
  } = useSearchQuery({
    variables: {
      searchData: {
        tagsetNames,
        terms: termsFromUrl,
        searchInSpaceFilter: spaceId,
        filters: [
          {
            category: SearchCategory.Spaces,
            size: SEARCH_RESULTS_COUNT,
            types: spaceFilterConfig.all.value,
            cursor: undefined,
          },
          {
            category: SearchCategory.CollaborationTools,
            size: SEARCH_RESULTS_COUNT,
            cursor: undefined,
          },
          {
            category: SearchCategory.Responses,
            size: SEARCH_RESULTS_COUNT,
            types: contributionFilterConfig.all.value,
            cursor: undefined,
          },
          {
            category: SearchCategory.Contributors,
            size: SEARCH_RESULTS_COUNT,
            types: contributorFilterConfig.all.value,
            cursor: undefined,
          },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    skip: hasNoTermsLength || resolvingSpace,
  });

  const results = hasNoTermsLength ? undefined : toResultType(data);

  const { spaceResults, contributionResults, contributorResults, calloutResults }: SearchViewSections = useMemo(
    () => groupBy(results, ({ type }) => findKey(searchResultSectionTypes, types => types.includes(type))),
    [results]
  );

  const { data: spaceDetails, loading } = useSearchScopeDetailsSpaceQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const fetchNewResults = useCallback(
    (resultsType: SearchCategory) => {
      const getFetchFilters = () => {
        switch (resultsType) {
          case SearchCategory.Spaces: {
            return [
              {
                category: SearchCategory.Spaces,
                size: SEARCH_RESULTS_COUNT,
                types: spaceFilter.value,
                cursor: resultsCursors.spaceCursor,
              },
            ];
          }

          case SearchCategory.CollaborationTools: {
            return [
              {
                category: SearchCategory.CollaborationTools,
                size: SEARCH_RESULTS_COUNT,
                cursor: resultsCursors.collaborationCursor,
              },
            ];
          }

          case SearchCategory.Responses: {
            return [
              {
                category: SearchCategory.Responses,
                size: SEARCH_RESULTS_COUNT,
                types: contributionFilter.value,
                cursor: resultsCursors.contributionCursor,
              },
            ];
          }

          case SearchCategory.Contributors: {
            return [
              {
                category: SearchCategory.Contributors,
                size: SEARCH_RESULTS_COUNT,
                types: contributorFilter.value,
                cursor: resultsCursors.contributorCursor,
              },
            ];
          }

          default: {
            return [
              {
                category: SearchCategory.Spaces,
                size: SEARCH_RESULTS_COUNT,
                types: spaceFilter.value,
                cursor: resultsCursors.spaceCursor,
              },
              {
                category: SearchCategory.CollaborationTools,
                size: SEARCH_RESULTS_COUNT,
                cursor: resultsCursors.collaborationCursor,
              },
              {
                category: SearchCategory.Responses,
                size: SEARCH_RESULTS_COUNT,
                types: contributionFilter.value,
                cursor: resultsCursors.contributionCursor,
              },
              {
                category: SearchCategory.Contributors,
                size: SEARCH_RESULTS_COUNT,
                types: contributorFilter.value,
                cursor: resultsCursors.contributorCursor,
              },
            ];
          }
        }
      };

      fetchMore({
        variables: {
          searchData: {
            tagsetNames,
            terms: termsFromUrl,
            filters: getFetchFilters(),
            searchInSpaceFilter: spaceId,
          },
        },

        updateQuery: (prev: SearchQuery, { fetchMoreResult }: { fetchMoreResult: SearchQuery }) => {
          switch (resultsType) {
            case SearchCategory.Spaces: {
              setCanSpaceLoadMore(fetchMoreResult?.search?.spaceResults?.results?.length > 0);
              break;
            }

            case SearchCategory.CollaborationTools: {
              setCalloutCanLoadMore(fetchMoreResult?.search?.calloutResults?.results?.length > 0);
              break;
            }

            case SearchCategory.Responses: {
              setCanContributionLoadMore(fetchMoreResult?.search?.contributionResults?.results?.length > 0);
              break;
            }

            case SearchCategory.Contributors: {
              setContributorCanLoadMore(fetchMoreResult?.search?.contributorResults?.results?.length > 0);
              break;
            }

            default: {
              break;
            }
          }

          switch (resultsType) {
            case SearchCategory.Spaces: {
              return {
                search: {
                  ...prev.search,
                  spaceResults: {
                    ...fetchMoreResult.search.spaceResults,
                    results: [...prev.search.spaceResults?.results, ...fetchMoreResult.search.spaceResults?.results],
                  },
                },
              };
            }

            case SearchCategory.CollaborationTools: {
              return {
                search: {
                  ...prev.search,
                  calloutResults: {
                    ...fetchMoreResult.search.calloutResults,
                    results: [
                      ...prev.search.calloutResults?.results,
                      ...fetchMoreResult.search.calloutResults?.results,
                    ],
                  },
                },
              };
            }

            case SearchCategory.Responses: {
              return {
                search: {
                  ...prev.search,
                  contributionResults: {
                    ...fetchMoreResult.search.contributionResults,
                    results: [
                      ...prev.search.contributionResults?.results,
                      ...fetchMoreResult.search.contributionResults?.results,
                    ],
                  },
                },
              };
            }

            case SearchCategory.Contributors: {
              return {
                search: {
                  ...prev.search,
                  contributorResults: {
                    ...fetchMoreResult.search.contributorResults,
                    results: [
                      ...prev.search.contributorResults?.results,
                      ...fetchMoreResult.search.contributorResults?.results,
                    ],
                  },
                },
              };
            }

            default:
              return prev;
          }
        },
      });
    },
    [
      spaceId,
      termsFromUrl,
      resultsCursors,
      spaceFilter.value,
      contributorFilter.value,
      contributionFilter.value,
      fetchMore,
    ]
  );

  useEffect(() => {
    if (hasNoTermsLength) {
      setSpaceFilter(spaceFilterConfig.all);
      setContributionFilter(contributionFilterConfig.all);
      setContributorFilter(contributorFilterConfig.all);
    }
  }, [hasNoTermsLength]);

  useEffect(() => {
    if (data?.search && !isSearching)
      setResultsCursors({
        spaceCursor: data.search.spaceResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
        collaborationCursor: data.search.calloutResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
        contributionCursor: data.search.contributionResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
        contributorCursor: data.search.contributorResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
      });
  }, [data, isSearching]);

  const isSearchingForMore = networkStatus === NetworkStatus.fetchMore;
  const convertedCalloutResults = calloutResults as SearchResultCalloutFragment[];

  const filteredSpaceResults =
    spaceFilter.typename === 'all'
      ? spaceResults
      : spaceResults?.filter(space =>
          spaceFilter.typename === 'space' ? space.type === 'SPACE' : space.type === 'SUBSPACE'
        );

  const filteredContributionResults =
    contributionFilter.typename === 'all'
      ? contributionResults
      : contributionResults.filter(contribution => contribution.type === 'POST');

  const filteredContributorResults =
    contributorFilter.typename === 'all'
      ? contributorResults
      : contributorResults.filter(contributor =>
          contributorFilter.typename === 'user' ? contributor.type === 'USER' : contributor.type === 'ORGANIZATION'
        );

  return (
    <PageContentColumn columns={12}>
      <PageContentBlockSeamless
        disablePadding
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#fff',
        }}
      >
        <MultipleSelect size="small" onChange={handleTermsChange} value={termsFromUrl} minLength={2} autoFocus />
      </PageContentBlockSeamless>

      {spaceId && (
        <SearchResultsScope
          currentScope={
            <SearchResultsScopeCard
              avatar={spaceDetails?.lookup.space?.about.profile.avatar}
              iconComponent={SpaceL0Icon}
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

      <Gutters disablePadding sx={{ width: '100%', flexDirection: 'row' }}>
        <FiltersDescriptionBlock />

        <Gutters disablePadding sx={{ width: '100%', flexDirection: 'column' }}>
          <SectionWrapper>
            <SearchResultSection
              tagId="spaces"
              title={spaceFilterTitle}
              filterTitle={t('pages.search.filter.type.space')}
              count={data?.search?.spaceResults?.total ?? 0}
              filterConfig={spaceFilterConfig}
              results={filteredSpaceResults}
              currentFilter={spaceFilter}
              onFilterChange={setSpaceFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultPostChooser}
              canLoadMore={canSpaceLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.Spaces)}
            />
          </SectionWrapper>

          <SectionWrapper>
            <SearchResultSection
              tagId="collaboration-tools"
              title={t('pages.search.filter.key.callout')}
              filterTitle={t('common.type')}
              count={data?.search?.calloutResults?.total ?? 0}
              filterConfig={undefined /* TODO: Callout filtering disabled for now calloutFilterConfig */}
              results={convertedCalloutResults}
              currentFilter={calloutFilter}
              onFilterChange={setCalloutFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultsCalloutCard}
              canLoadMore={canCalloutLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.CollaborationTools)}
            />
          </SectionWrapper>

          <SectionWrapper>
            <SearchResultSection
              tagId="responses"
              title={t('pages.search.filter.key.response')}
              filterTitle={t('pages.search.filter.type.contribution')}
              count={data?.search?.contributionResults?.total ?? 0}
              filterConfig={contributionFilterConfig}
              results={filteredContributionResults}
              currentFilter={contributionFilter}
              onFilterChange={setContributionFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultPostChooser}
              canLoadMore={canContributionLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.Responses)}
            />
          </SectionWrapper>

          <SectionWrapper>
            <SearchResultSection
              tagId="contributors"
              title={t('common.contributors')}
              filterTitle={t('pages.search.filter.type.contributor')}
              count={data?.search?.contributorResults?.total ?? 0}
              filterConfig={contributorFilterConfig}
              results={filteredContributorResults}
              currentFilter={contributorFilter}
              onFilterChange={setContributorFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultPostChooser}
              canLoadMore={canContributorLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.Contributors)}
            />
          </SectionWrapper>
        </Gutters>
      </Gutters>
    </PageContentColumn>
  );
};

export default SearchView;

function toResultType(query?: SearchQuery): SearchResultMetaType[] {
  if (!query) {
    return [];
  }

  const spaceResults = (query.search.spaceResults?.results || []).map<SearchResultMetaType>(
    ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] }) as SearchResultMetaType
  );

  const contributionResults = (query.search.contributionResults?.results || []).map<SearchResultMetaType>(
    ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] }) as SearchResultMetaType
  );

  const contributorResults = (query.search.contributorResults?.results || []).map<SearchResultMetaType>(
    ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] }) as SearchResultMetaType
  );

  const calloutResults = (query.search.calloutResults?.results || []).map<SearchResultMetaType>(
    ({ score, terms, ...rest }) => ({ ...rest, score: score || 0, terms: terms || [] }) as SearchResultMetaType
  );

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
        position: 'sticky',
        top: 80,

        minWidth: 250,
        borderRadius: 1,
        height: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <FiltersDescriptionBlockItem href="#spaces">
        <HubOutlined />
        <Caption>{t('components.searchDialog.spacesAndSubspaces')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#collaboration-tools">
        <DrawOutlined />
        <Caption>{t('pages.search.filter.key.callout')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#responses">
        <LibraryBooksOutlined />
        <Caption>{t('pages.search.filter.key.response')}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#contributors">
        <GroupOutlined />
        <Caption>{t('common.contributors')}</Caption>
      </FiltersDescriptionBlockItem>
    </Gutters>
  );
}

function FiltersDescriptionBlockItem({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <Link href={href} underline="none">
      <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}>{children}</Gutters>
    </Link>
  );
}
