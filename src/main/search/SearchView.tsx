import { useMemo, useState, useEffect, ReactNode, useCallback, PropsWithChildren } from 'react';

import { Box, Link } from '@mui/material';
import { findKey, groupBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { NetworkStatus } from '@apollo/client';

import Gutters from '@/core/ui/grid/Gutters';
import {
  useSearchQuery,
  useSpaceUrlResolverQuery,
  useSearchScopeDetailsSpaceQuery,
} from '@/core/apollo/generated/apollo-hooks';
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
  SearchResultMemoFragment,
  SearchResultWhiteboardFragment,
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
  framingFilterConfig,
  contributionFilterConfig,
  contributorFilterConfig,
} from './Filter';
import SearchResultSection from './SearchResultSection';
import SearchResultPostChooser from './searchResults/SearchResultPostChooser';
import SearchResultsCalloutCard from './searchResults/searchResultsCallout/SearchResultsCalloutCard';

import { useSearchTerms } from './useSearchTerms';
import { buildLoginUrl } from '../routing/urlBuilders';
import AlkemioLogo from '../ui/logo/logoSmall.svg?react';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from './constants';
import FiltersDescriptionBlock from './ui/FilterDescriptionsBlock';

export type TypedSearchResult<Type extends SearchResultType, ResultFragment extends {}> = SearchResult &
  ResultFragment & { type: Type };

export type SearchResultMetaType =
  | TypedSearchResult<SearchResultType.User, SearchResultUserFragment>
  | TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  | TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>
  | TypedSearchResult<SearchResultType.Space, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Subspace, SearchResultSpaceFragment>
  | TypedSearchResult<SearchResultType.Callout, SearchResultCalloutFragment>
  | TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>
  | TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>;

interface SearchViewProps {
  searchRoute: string;
  spaceFilterConfig: FilterConfig;
  spaceFilterTitle: ReactNode;
}

interface SearchViewSections {
  spaceResults?: SearchResultMetaType[];
  calloutResults?: SearchResultMetaType[];
  framingResults?: SearchResultMetaType[];
  contributionResults?: SearchResultMetaType[];
  contributorResults?: SearchResultMetaType[];
}

type ResultsCursors = {
  spaceCursor: string | undefined;
  calloutCursor: string | undefined;
  framingCursor: string | undefined;
  contributionCursor: string | undefined;
  contributorCursor: string | undefined;
};

const searchResultSectionTypes: Record<keyof SearchViewSections, SearchResultType[]> = {
  spaceResults: [SearchResultType.Space, SearchResultType.Subspace],
  calloutResults: [SearchResultType.Callout],
  framingResults: [SearchResultType.Memo, SearchResultType.Whiteboard],
  contributionResults: [SearchResultType.Post, SearchResultType.Memo, SearchResultType.Whiteboard],
  contributorResults: [SearchResultType.User, SearchResultType.Organization],
};

const SEARCH_RESULTS_COUNT = 4;
export const MAX_TERMS_SEARCH = 5;
const tagsetNames = ['skills', 'keywords'];

const Logo = () => <AlkemioLogo />;

const SearchView = ({ searchRoute, spaceFilterConfig, spaceFilterTitle }: SearchViewProps) => {
  const [canSpaceLoadMore, setCanSpaceLoadMore] = useState(true);
  const [canCalloutLoadMore, setCalloutCanLoadMore] = useState(true);
  const [canFramingLoadMore, setCanFramingLoadMore] = useState(true);
  const [canContributionLoadMore, setCanContributionLoadMore] = useState(true);
  const [canContributorLoadMore, setContributorCanLoadMore] = useState(true);

  const [resultsCursors, setResultsCursors] = useState<ResultsCursors>({
    spaceCursor: undefined,
    calloutCursor: undefined,
    framingCursor: undefined,
    contributionCursor: undefined,
    contributorCursor: undefined,
  });
  const [spaceFilter, setSpaceFilter] = useState<FilterDefinition>(spaceFilterConfig.all);
  const [calloutFilter, setCalloutFilter] = useState<FilterDefinition>(calloutFilterConfig.all);
  const [framingFilter, setFramingFilter] = useState<FilterDefinition>(framingFilterConfig.all);
  const [contributionFilter, setContributionFilter] = useState<FilterDefinition>(contributionFilterConfig.all);
  const [contributorFilter, setContributorFilter] = useState<FilterDefinition>(contributorFilterConfig.all);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const termsFromUrl = useSearchTerms();

  const queryParams = useMemoizedQueryParams();

  const { isAuthenticated } = useCurrentUserContext();

  const spaceNameId = queryParams[SEARCH_SPACE_URL_PARAM]?.[0] ?? undefined;

  const handleTermsChange = useCallback(
    (newValue: string[]) => {
      setCanSpaceLoadMore(true);
      setCalloutCanLoadMore(true);
      setCanFramingLoadMore(true);
      setCanContributionLoadMore(true);
      setContributorCanLoadMore(true);

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
            category: SearchCategory.Framings,
            size: SEARCH_RESULTS_COUNT,
            types: framingFilterConfig.all.value,
            cursor: undefined,
          },
          {
            category: SearchCategory.Contributions,
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

  const { spaceResults, calloutResults, framingResults, contributionResults, contributorResults }: SearchViewSections =
    useMemo(
      () => groupBy(results, ({ type }) => findKey(searchResultSectionTypes, types => types.includes(type))),
      [results]
    );

  console.log('results', results);
  console.log('r', {
    spaceResults,
    calloutResults,
    framingResults,
    contributionResults,
    contributorResults,
  });

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
                cursor: resultsCursors.calloutCursor,
              },
            ];
          }

          case SearchCategory.Framings: {
            return [
              {
                category: SearchCategory.Framings,
                size: SEARCH_RESULTS_COUNT,
                types: framingFilter.value,
                cursor: resultsCursors.framingCursor,
              },
            ];
          }

          case SearchCategory.Contributions: {
            return [
              {
                category: SearchCategory.Contributions,
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
                cursor: resultsCursors.calloutCursor,
              },
              {
                category: SearchCategory.Framings,
                size: SEARCH_RESULTS_COUNT,
                types: framingFilter.value,
                cursor: resultsCursors.framingCursor,
              },
              {
                category: SearchCategory.Contributions,
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

            case SearchCategory.Framings: {
              setCanFramingLoadMore(fetchMoreResult?.search?.framingResults?.results?.length > 0);
              break;
            }

            case SearchCategory.Contributions: {
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

            case SearchCategory.Framings: {
              return {
                search: {
                  ...prev.search,
                  framingResults: {
                    ...fetchMoreResult.search.framingResults,
                    results: [
                      ...prev.search.framingResults?.results,
                      ...fetchMoreResult.search.framingResults?.results,
                    ],
                  },
                },
              };
            }

            case SearchCategory.Contributions: {
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
      // calloutFilter.value,
      framingFilter.value,
      contributionFilter.value,
      contributorFilter.value,
      fetchMore,
    ]
  );

  useEffect(() => {
    if (hasNoTermsLength) {
      setSpaceFilter(spaceFilterConfig.all);
      setCalloutFilter(calloutFilterConfig.all);
      setFramingFilter(framingFilterConfig.all);
      setContributionFilter(contributionFilterConfig.all);
      setContributorFilter(contributorFilterConfig.all);
    }
  }, [hasNoTermsLength]);

  useEffect(() => {
    if (data?.search && !isSearching)
      setResultsCursors({
        spaceCursor: data.search.spaceResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
        calloutCursor: data.search.calloutResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
        framingCursor: data.search.framingResults?.cursor ?? undefined, // This check is required since the BE return `null` when cursor is missing
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

  const filteredFramingResults =
    framingFilter.typename === 'all'
      ? framingResults
      : framingResults.filter(framing => {
          switch (framingFilter.typename) {
            case 'memo':
              return framing.type === 'MEMO';
            case 'whiteboard':
              return framing.type === 'WHITEBOARD';
            default:
              return true;
          }
        });

  const filteredContributionResults =
    contributionFilter.typename === 'all'
      ? contributionResults
      : contributionResults.filter(contribution => {
          switch (contributionFilter.typename) {
            case 'post':
              return contribution.type === 'POST';
            case 'memo':
              return contribution.type === 'MEMO';
            case 'whiteboard':
              return contribution.type === 'WHITEBOARD';
            default:
              return true;
          }
        });

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
        <FiltersDescriptionBlock results={data?.search} />

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
              tagId="framing"
              title={t('pages.search.filter.key.framing')}
              filterTitle={t('pages.search.filter.type.framing')}
              count={data?.search?.framingResults?.total ?? 0}
              filterConfig={framingFilterConfig}
              results={filteredFramingResults}
              currentFilter={framingFilter}
              onFilterChange={setFramingFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultPostChooser}
              canLoadMore={canFramingLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.Framings)}
            />
          </SectionWrapper>

          <SectionWrapper>
            <SearchResultSection
              tagId="contributions"
              title={t('pages.search.filter.key.contribution')}
              filterTitle={t('pages.search.filter.type.contribution')}
              count={data?.search?.contributionResults?.total ?? 0}
              filterConfig={contributionFilterConfig}
              results={filteredContributionResults}
              currentFilter={contributionFilter}
              onFilterChange={setContributionFilter}
              loading={isSearching || isSearchingForMore} // TODO: Add logic to check if the search is in the given section because now all buttons animate loading!
              cardComponent={SearchResultPostChooser}
              canLoadMore={canContributionLoadMore}
              onClickLoadMore={() => fetchNewResults(SearchCategory.Contributions)}
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

  const framingResults = (query.search.framingResults?.results || []).map<SearchResultMetaType>(
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

  return [...spaceResults, ...framingResults, ...contributionResults, ...contributorResults, ...calloutResults];
}

function SectionWrapper({ children }: PropsWithChildren) {
  return <Box sx={{ display: 'flex', flexDirection: 'row', gap: gutters(1) }}>{children}</Box>;
}
