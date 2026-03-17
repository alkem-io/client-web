import { NetworkStatus } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import {
  useSearchQuery,
  useSearchScopeDetailsSpaceQuery,
  useSpaceUrlResolverQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { SearchCategory, type SearchQuery } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useMemoizedQueryParams } from '@/core/routing/useQueryParams';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from './constants';
import {
  calloutFilterConfig,
  contributionFilterConfig,
  contributorFilterConfig,
  type FilterConfig,
  type FilterDefinition,
  framingFilterConfig,
} from './Filter';
import type { SearchResultMetaType } from './SearchView';
import { useSearchTerms } from './useSearchTerms';

type ResultsCursors = {
  spaceCursor: string | undefined;
  calloutCursor: string | undefined;
  framingCursor: string | undefined;
  contributionCursor: string | undefined;
  contributorCursor: string | undefined;
};

const SEARCH_RESULTS_COUNT = 4;
const tagsetNames = ['skills', 'keywords'];

const concatSearchResults = <T>(a: T[] = [], b: T[] = []): T[] => [...a, ...b];

function toResultType(query?: SearchQuery) {
  const mapResults = (results: unknown[] | undefined) =>
    (results || []).map<SearchResultMetaType>(
      (item: any) => ({ ...item, score: item.score || 0, terms: item.terms || [] }) as SearchResultMetaType
    );

  return {
    spaceResults: mapResults(query?.search.spaceResults?.results),
    calloutResults: mapResults(query?.search.calloutResults?.results),
    framingResults: mapResults(query?.search.framingResults?.results),
    contributionResults: mapResults(query?.search.contributionResults?.results),
    contributorResults: mapResults(query?.search.actorResults?.results),
  };
}

export const useSearchViewState = (searchRoute: string, spaceFilterConfig: FilterConfig) => {
  const [canSpaceLoadMore, setCanSpaceLoadMore] = useState(true);
  const [canCalloutLoadMore, setCanCalloutLoadMore] = useState(true);
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
  const termsFromUrl = useSearchTerms();
  const queryParams = useMemoizedQueryParams();
  const { isAuthenticated } = useCurrentUserContext();

  const spaceNameId = queryParams[SEARCH_SPACE_URL_PARAM]?.[0] ?? undefined;

  const handleTermsChange = useCallback(
    (newValue: string[]) => {
      setCanSpaceLoadMore(true);
      setCanCalloutLoadMore(true);
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
            types: calloutFilterConfig.all.value,
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

  const { spaceResults, calloutResults, framingResults, contributionResults, contributorResults } = toResultType(
    hasNoTermsLength ? undefined : data
  );

  const { data: spaceDetails, loading: spaceDetailsLoading } = useSearchScopeDetailsSpaceQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const fetchNewResults = useCallback(
    (resultsType: SearchCategory) => {
      const getFetchFilters = () => {
        switch (resultsType) {
          case SearchCategory.Spaces:
            return [
              {
                category: SearchCategory.Spaces,
                size: SEARCH_RESULTS_COUNT,
                types: spaceFilter.value,
                cursor: resultsCursors.spaceCursor,
              },
            ];
          case SearchCategory.CollaborationTools:
            return [
              {
                category: SearchCategory.CollaborationTools,
                size: SEARCH_RESULTS_COUNT,
                cursor: resultsCursors.calloutCursor,
              },
            ];
          case SearchCategory.Framings:
            return [
              {
                category: SearchCategory.Framings,
                size: SEARCH_RESULTS_COUNT,
                types: framingFilter.value,
                cursor: resultsCursors.framingCursor,
              },
            ];
          case SearchCategory.Contributions:
            return [
              {
                category: SearchCategory.Contributions,
                size: SEARCH_RESULTS_COUNT,
                types: contributionFilter.value,
                cursor: resultsCursors.contributionCursor,
              },
            ];
          case SearchCategory.Contributors:
            return [
              {
                category: SearchCategory.Contributors,
                size: SEARCH_RESULTS_COUNT,
                types: contributorFilter.value,
                cursor: resultsCursors.contributorCursor,
              },
            ];
          default:
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
            case SearchCategory.Spaces:
              setCanSpaceLoadMore(fetchMoreResult?.search?.spaceResults?.results?.length > 0);
              break;
            case SearchCategory.CollaborationTools:
              setCanCalloutLoadMore(fetchMoreResult?.search?.calloutResults?.results?.length > 0);
              break;
            case SearchCategory.Framings:
              setCanFramingLoadMore(fetchMoreResult?.search?.framingResults?.results?.length > 0);
              break;
            case SearchCategory.Contributions:
              setCanContributionLoadMore(fetchMoreResult?.search?.contributionResults?.results?.length > 0);
              break;
            case SearchCategory.Contributors:
              setContributorCanLoadMore(fetchMoreResult?.search?.actorResults?.results?.length > 0);
              break;
          }

          switch (resultsType) {
            case SearchCategory.Spaces:
              return {
                search: {
                  ...prev.search,
                  spaceResults: {
                    ...fetchMoreResult.search.spaceResults,
                    results: concatSearchResults(
                      prev.search.spaceResults?.results,
                      fetchMoreResult.search.spaceResults?.results
                    ),
                  },
                },
              };
            case SearchCategory.CollaborationTools:
              return {
                search: {
                  ...prev.search,
                  calloutResults: {
                    ...fetchMoreResult.search.calloutResults,
                    results: concatSearchResults(
                      prev.search.calloutResults?.results,
                      fetchMoreResult.search.calloutResults?.results
                    ),
                  },
                },
              };
            case SearchCategory.Framings:
              return {
                search: {
                  ...prev.search,
                  framingResults: {
                    ...fetchMoreResult.search.framingResults,
                    results: concatSearchResults(
                      prev.search.framingResults?.results,
                      fetchMoreResult.search.framingResults?.results
                    ),
                  },
                },
              };
            case SearchCategory.Contributions:
              return {
                search: {
                  ...prev.search,
                  contributionResults: {
                    ...fetchMoreResult.search.contributionResults,
                    results: concatSearchResults(
                      prev.search.contributionResults?.results,
                      fetchMoreResult.search.contributionResults?.results
                    ),
                  },
                },
              };
            case SearchCategory.Contributors:
              return {
                search: {
                  ...prev.search,
                  actorResults: {
                    ...fetchMoreResult.search.actorResults,
                    results: concatSearchResults(
                      prev.search.actorResults?.results,
                      fetchMoreResult.search.actorResults?.results
                    ),
                  },
                },
              };
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
      calloutFilter.value,
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
        spaceCursor: data.search.spaceResults?.cursor ?? undefined,
        calloutCursor: data.search.calloutResults?.cursor ?? undefined,
        framingCursor: data.search.framingResults?.cursor ?? undefined,
        contributionCursor: data.search.contributionResults?.cursor ?? undefined,
        contributorCursor: data.search.actorResults?.cursor ?? undefined,
      });
  }, [data, isSearching]);

  const isSearchingForMore = networkStatus === NetworkStatus.fetchMore;

  return {
    data,
    termsFromUrl,
    isAuthenticated,
    isSearching,
    isSearchingForMore,
    hasNoTermsLength,
    spaceId,
    spaceDetails,
    spaceDetailsLoading,
    spaceResults,
    calloutResults,
    framingResults,
    contributionResults,
    contributorResults,
    spaceFilter,
    setSpaceFilter,
    framingFilter,
    setFramingFilter,
    contributionFilter,
    setContributionFilter,
    contributorFilter,
    setContributorFilter,
    canSpaceLoadMore,
    canCalloutLoadMore,
    canFramingLoadMore,
    canContributionLoadMore,
    canContributorLoadMore,
    handleTermsChange,
    handleSearchInPlatform,
    fetchNewResults,
  };
};
