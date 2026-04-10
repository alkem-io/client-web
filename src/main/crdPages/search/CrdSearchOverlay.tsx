import { Building2, FileText, Globe, MessageSquare, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSearchQuery, useSpaceUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import { SearchCategory, type SearchQuery, SearchResultType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { OrgResultCard } from '@/crd/components/search/OrgResultCard';
import { PostResultCard } from '@/crd/components/search/PostResultCard';
import { ResponseResultCard } from '@/crd/components/search/ResponseResultCard';
import type { SearchCategoryId, SidebarCategory } from '@/crd/components/search/SearchCategorySidebar';
import {
  SearchOverlay,
  type SearchOverlayCategory,
  type SearchOverlayState,
} from '@/crd/components/search/SearchOverlay';
import type { SearchFilterOption } from '@/crd/components/search/SearchResultSection';

import { UserResultCard } from '@/crd/components/search/UserResultCard';
import { SpaceCard } from '@/crd/components/space/SpaceCard';
import { useSearch } from '../../search/SearchContext';
import type { SearchResultMetaType } from '../../search/searchTypes';
import {
  mapOrgResults,
  mapPostResults,
  mapResponseResults,
  mapSpaceResults,
  mapUserResults,
  type SearchFallbackLabels,
} from './searchDataMapper';

const MAX_TAGS = 5;
const PAGE_SIZE = 4;
const SEARCH_RESULTS_COUNT = 4;
const tagsetNames = ['skills', 'keywords'];

const concatSearchResults = <T,>(a: T[] = [], b: T[] = []): T[] => [...a, ...b];

function toResultType(query?: SearchQuery) {
  const mapResults = (results: unknown[] | undefined) =>
    (results || []).map<SearchResultMetaType>(
      item =>
        ({
          ...(item as Record<string, unknown>),
          score: (item as Record<string, unknown>).score || 0,
          terms: (item as Record<string, unknown>).terms || [],
        }) as SearchResultMetaType
    );

  return {
    spaceResults: mapResults(query?.search.spaceResults?.results),
    calloutResults: mapResults(query?.search.calloutResults?.results),
    framingResults: mapResults(query?.search.framingResults?.results),
    contributionResults: mapResults(query?.search.contributionResults?.results),
    contributorResults: mapResults(query?.search.actorResults?.results),
  };
}

function extractSpaceNameIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/space\/([^/]+)/);
  return match?.[1];
}

export function CrdSearchOverlay() {
  const { t } = useTranslation('crd-search');
  const { isOpen, closeSearch, initialQuery, clearInitialQuery } = useSearch();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sectionFilters, setSectionFilters] = useState<Record<SearchCategoryId, string>>({
    spaces: 'all',
    posts: 'all',
    responses: 'all',
    users: 'all',
    organizations: 'all',
  });
  const [visibleCounts, setVisibleCounts] = useState<Record<SearchCategoryId, number>>({
    spaces: PAGE_SIZE,
    posts: PAGE_SIZE,
    responses: PAGE_SIZE,
    users: PAGE_SIZE,
    organizations: PAGE_SIZE,
  });

  const [canSpaceLoadMore, setCanSpaceLoadMore] = useState(true);
  const [canCalloutLoadMore, setCanCalloutLoadMore] = useState(true);
  const [canFramingLoadMore, setCanFramingLoadMore] = useState(true);
  const [canContributionLoadMore, setCanContributionLoadMore] = useState(true);
  const [canContributorLoadMore, setCanContributorLoadMore] = useState(true);

  // Detect space from current route pathname
  const spaceNameId = extractSpaceNameIdFromPath(pathname);

  const { data: spaceIdData, loading: resolvingSpace } = useSpaceUrlResolverQuery({
    variables: { spaceNameId: spaceNameId ?? '' },
    skip: !spaceNameId,
  });
  const spaceId = spaceIdData?.lookupByName.space?.id;

  // spaceId is used for scoping the search query — no UI for scope switching

  // Direct search query — local state only, no URL navigation
  const {
    data,
    loading: isSearching,
    fetchMore,
  } = useSearchQuery({
    variables: {
      searchData: {
        tagsetNames,
        terms: searchTags,
        searchInSpaceFilter: spaceId,
        filters: [
          {
            category: SearchCategory.Spaces,
            size: SEARCH_RESULTS_COUNT,
            types: [SearchResultType.Space, SearchResultType.Subspace],
            cursor: undefined,
          },
          {
            category: SearchCategory.CollaborationTools,
            size: SEARCH_RESULTS_COUNT,
            types: [SearchResultType.Callout],
            cursor: undefined,
          },
          {
            category: SearchCategory.Framings,
            size: SEARCH_RESULTS_COUNT,
            types: [SearchResultType.Whiteboard, SearchResultType.Memo],
            cursor: undefined,
          },
          {
            category: SearchCategory.Contributions,
            size: SEARCH_RESULTS_COUNT,
            types: [SearchResultType.Post, SearchResultType.Whiteboard, SearchResultType.Memo],
            cursor: undefined,
          },
          {
            category: SearchCategory.Contributors,
            size: SEARCH_RESULTS_COUNT,
            types: [SearchResultType.User, SearchResultType.Organization],
            cursor: undefined,
          },
        ],
      },
    },
    fetchPolicy: 'no-cache',
    skip: searchTags.length === 0 || resolvingSpace,
  });

  // Track canLoadMore flags from initial query results
  useEffect(() => {
    if (data?.search && !isSearching) {
      setCanSpaceLoadMore((data.search.spaceResults?.results?.length ?? 0) >= SEARCH_RESULTS_COUNT);
      setCanCalloutLoadMore((data.search.calloutResults?.results?.length ?? 0) >= SEARCH_RESULTS_COUNT);
      setCanFramingLoadMore((data.search.framingResults?.results?.length ?? 0) >= SEARCH_RESULTS_COUNT);
      setCanContributionLoadMore((data.search.contributionResults?.results?.length ?? 0) >= SEARCH_RESULTS_COUNT);
      setCanContributorLoadMore((data.search.actorResults?.results?.length ?? 0) >= SEARCH_RESULTS_COUNT);
    }
  }, [data, isSearching]);

  // Cursors from the response for fetchMore
  const spaceCursor = data?.search.spaceResults?.cursor;
  const calloutCursor = data?.search.calloutResults?.cursor;
  const framingCursor = data?.search.framingResults?.cursor;
  const contributionCursor = data?.search.contributionResults?.cursor;
  const contributorCursor = data?.search.actorResults?.cursor;

  // Initialize from initialQuery when overlay opens
  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchTags([initialQuery]);
      clearInitialQuery();
    }
  }, [isOpen, initialQuery]);

  // Reset state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTags([]);
      setInputValue('');
      setSectionFilters({
        spaces: 'all',
        posts: 'all',
        responses: 'all',
        users: 'all',
        organizations: 'all',
      });
      setVisibleCounts({
        spaces: PAGE_SIZE,
        posts: PAGE_SIZE,
        responses: PAGE_SIZE,
        users: PAGE_SIZE,
        organizations: PAGE_SIZE,
      });
      setCanSpaceLoadMore(true);
      setCanCalloutLoadMore(true);
      setCanFramingLoadMore(true);
      setCanContributionLoadMore(true);
      setCanContributorLoadMore(true);
    }
  }, [isOpen]);

  // Map results
  const { spaceResults, calloutResults, framingResults, contributionResults, contributorResults } = toResultType(
    searchTags.length === 0 ? undefined : data
  );

  const fallbackLabels: SearchFallbackLabels = {
    unknown: t('search.fallback.unknown'),
    organization: t('search.fallback.organization'),
  };

  const mappedSpaces = mapSpaceResults(spaceResults ?? []);
  const mappedPosts = mapPostResults(calloutResults ?? [], framingResults ?? [], fallbackLabels);
  const mappedResponses = mapResponseResults(contributionResults ?? [], fallbackLabels);
  const mappedUsers = mapUserResults(contributorResults ?? []);
  const mappedOrgs = mapOrgResults(contributorResults ?? [], fallbackLabels);

  // Apply local filters
  const filteredSpaces =
    sectionFilters.spaces === 'all'
      ? mappedSpaces
      : sectionFilters.spaces === 'space'
        ? mappedSpaces.filter(s => !s.parent)
        : mappedSpaces.filter(s => !!s.parent);

  const filteredPosts =
    sectionFilters.posts === 'all' ? mappedPosts : mappedPosts.filter(p => p.type === sectionFilters.posts);

  const filteredResponses =
    sectionFilters.responses === 'all'
      ? mappedResponses
      : mappedResponses.filter(r => r.type === sectionFilters.responses);

  // Users and orgs have no sub-filters
  const filteredUsers = mappedUsers;
  const filteredOrgs = mappedOrgs;

  // Determine overlay state
  const hasNoTags = searchTags.length === 0;
  const hasAnyResults =
    mappedSpaces.length > 0 ||
    mappedPosts.length > 0 ||
    mappedResponses.length > 0 ||
    mappedUsers.length > 0 ||
    mappedOrgs.length > 0;

  // When tags exist but data hasn't arrived yet (data is undefined/null and not loading),
  // treat as loading to avoid a flash of "no results" before the query fires.
  const queryNotStartedYet = !hasNoTags && !data && !isSearching;

  let overlayState: SearchOverlayState = 'empty';
  if (!hasNoTags) {
    if (isSearching || queryNotStartedYet) {
      overlayState = 'loading';
    } else if (hasAnyResults) {
      overlayState = 'results';
    } else {
      overlayState = 'no-results';
    }
  }

  // Navigation
  const handleCardClick = (href: string) => {
    closeSearch();
    navigate(href);
  };

  // Tag management — local state only, no URL navigation
  const handleTagAdd = (term: string) => {
    setSearchTags(prev => [...prev, term]);
  };

  const handleTagRemove = (index: number) => {
    setSearchTags(prev => prev.filter((_, i) => i !== index));
  };

  // Filter options
  const spaceFilterOptions: SearchFilterOption[] = [
    { value: 'all', label: t('search.filters.all') },
    { value: 'space', label: t('search.filters.spacesOnly') },
    { value: 'subspace', label: t('search.filters.subspacesOnly') },
  ];

  const postFilterOptions: SearchFilterOption[] = [
    { value: 'all', label: t('search.filters.all') },
    { value: 'whiteboard', label: t('search.filters.whiteboards') },
    { value: 'memo', label: t('search.filters.memos') },
  ];

  const responseFilterOptions: SearchFilterOption[] = [
    { value: 'all', label: t('search.filters.all') },
    { value: 'post', label: t('search.filters.posts') },
    { value: 'whiteboard', label: t('search.filters.whiteboards') },
    { value: 'memo', label: t('search.filters.memos') },
  ];

  // Section filter change handler
  const handleFilterChange = (categoryId: SearchCategoryId) => (value: string) => {
    setSectionFilters(prev => ({ ...prev, [categoryId]: value }));
  };

  // fetchMore from backend for a specific category
  const fetchMoreResults = (resultsType: SearchCategory) => {
    const getCursorAndTypes = () => {
      switch (resultsType) {
        case SearchCategory.Spaces:
          return { cursor: spaceCursor, types: [SearchResultType.Space, SearchResultType.Subspace] };
        case SearchCategory.CollaborationTools:
          return { cursor: calloutCursor, types: [SearchResultType.Callout] };
        case SearchCategory.Framings:
          return { cursor: framingCursor, types: [SearchResultType.Whiteboard, SearchResultType.Memo] };
        case SearchCategory.Contributions:
          return {
            cursor: contributionCursor,
            types: [SearchResultType.Post, SearchResultType.Whiteboard, SearchResultType.Memo],
          };
        case SearchCategory.Contributors:
          return { cursor: contributorCursor, types: [SearchResultType.User, SearchResultType.Organization] };
        default:
          return { cursor: undefined, types: [] as SearchResultType[] };
      }
    };

    const { cursor, types } = getCursorAndTypes();

    fetchMore({
      variables: {
        searchData: {
          tagsetNames,
          terms: searchTags,
          searchInSpaceFilter: spaceId,
          filters: [{ category: resultsType, size: SEARCH_RESULTS_COUNT, types, cursor }],
        },
      },
      updateQuery: (prev: SearchQuery, { fetchMoreResult }: { fetchMoreResult: SearchQuery }) => {
        switch (resultsType) {
          case SearchCategory.Spaces:
            setCanSpaceLoadMore((fetchMoreResult?.search?.spaceResults?.results?.length ?? 0) > 0);
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
            setCanCalloutLoadMore((fetchMoreResult?.search?.calloutResults?.results?.length ?? 0) > 0);
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
            setCanFramingLoadMore((fetchMoreResult?.search?.framingResults?.results?.length ?? 0) > 0);
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
            setCanContributionLoadMore((fetchMoreResult?.search?.contributionResults?.results?.length ?? 0) > 0);
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
            setCanContributorLoadMore((fetchMoreResult?.search?.actorResults?.results?.length ?? 0) > 0);
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
  };

  // Load more handler
  const handleLoadMore = (categoryId: SearchCategoryId) => () => {
    setVisibleCounts(prev => {
      const newCount = prev[categoryId] + PAGE_SIZE;
      return { ...prev, [categoryId]: newCount };
    });

    // If we've shown all locally available results, fetch more from backend
    const nextVisibleCount = visibleCounts[categoryId] + PAGE_SIZE;
    switch (categoryId) {
      case 'spaces':
        if (nextVisibleCount >= filteredSpaces.length && canSpaceLoadMore) {
          fetchMoreResults(SearchCategory.Spaces);
        }
        break;
      case 'posts':
        if (nextVisibleCount >= filteredPosts.length) {
          if (canCalloutLoadMore) fetchMoreResults(SearchCategory.CollaborationTools);
          if (canFramingLoadMore) fetchMoreResults(SearchCategory.Framings);
        }
        break;
      case 'responses':
        if (nextVisibleCount >= filteredResponses.length && canContributionLoadMore) {
          fetchMoreResults(SearchCategory.Contributions);
        }
        break;
      case 'users':
      case 'organizations':
        if (
          filteredUsers.length + filteredOrgs.length <= visibleCounts.users + visibleCounts.organizations + PAGE_SIZE &&
          canContributorLoadMore
        ) {
          fetchMoreResults(SearchCategory.Contributors);
        }
        break;
    }
  };

  // Build categories — show a section if there are ANY unfiltered results (even if current filter yields 0).
  // This keeps the filter dropdown accessible so the user can switch back.
  const categories: SearchOverlayCategory[] = [];

  if (mappedSpaces.length > 0) {
    const visibleSpaces = filteredSpaces.slice(0, visibleCounts.spaces);
    const allLocalShown = visibleCounts.spaces >= filteredSpaces.length;
    categories.push({
      id: 'spaces',
      label: t('search.categories.spaces'),
      icon: Globe,
      count: filteredSpaces.length,
      filterOptions: spaceFilterOptions,
      activeFilter: sectionFilters.spaces,
      onFilterChange: handleFilterChange('spaces'),
      hasMore:
        filteredSpaces.length > 0 &&
        (visibleCounts.spaces < filteredSpaces.length || (allLocalShown && canSpaceLoadMore)),
      onLoadMore: handleLoadMore('spaces'),
      children: visibleSpaces.map(space => (
        <li key={space.id}>
          <SpaceCard space={space} onClick={() => handleCardClick(space.href)} />
        </li>
      )),
    });
  }

  if (mappedPosts.length > 0) {
    const visiblePosts = filteredPosts.slice(0, visibleCounts.posts);
    const allLocalShown = visibleCounts.posts >= filteredPosts.length;
    categories.push({
      id: 'posts',
      label: t('search.categories.posts'),
      icon: FileText,
      count: filteredPosts.length,
      filterOptions: postFilterOptions,
      activeFilter: sectionFilters.posts,
      onFilterChange: handleFilterChange('posts'),
      hasMore:
        filteredPosts.length > 0 &&
        (visibleCounts.posts < filteredPosts.length || (allLocalShown && (canCalloutLoadMore || canFramingLoadMore))),
      onLoadMore: handleLoadMore('posts'),
      children: visiblePosts.map(post => (
        <li key={post.id}>
          <PostResultCard post={post} onClick={() => handleCardClick(post.href)} />
        </li>
      )),
    });
  }

  if (mappedResponses.length > 0) {
    const visibleResponses = filteredResponses.slice(0, visibleCounts.responses);
    const allLocalShown = visibleCounts.responses >= filteredResponses.length;
    categories.push({
      id: 'responses',
      label: t('search.categories.responses'),
      icon: MessageSquare,
      count: filteredResponses.length,
      filterOptions: responseFilterOptions,
      activeFilter: sectionFilters.responses,
      onFilterChange: handleFilterChange('responses'),
      hasMore:
        filteredResponses.length > 0 &&
        (visibleCounts.responses < filteredResponses.length || (allLocalShown && canContributionLoadMore)),
      onLoadMore: handleLoadMore('responses'),
      children: visibleResponses.map(response => (
        <li key={response.id}>
          <ResponseResultCard response={response} onClick={() => handleCardClick(response.href)} />
        </li>
      )),
    });
  }

  if (mappedUsers.length > 0) {
    const visibleUsers = filteredUsers.slice(0, visibleCounts.users);
    const allLocalShown = visibleCounts.users >= filteredUsers.length;
    categories.push({
      id: 'users',
      label: t('search.categories.users'),
      icon: Users,
      count: filteredUsers.length,
      activeFilter: 'all',
      onFilterChange: () => {},
      hasMore: visibleCounts.users < filteredUsers.length || (allLocalShown && canContributorLoadMore),
      onLoadMore: handleLoadMore('users'),
      children: visibleUsers.map(user => (
        <li key={user.id}>
          <UserResultCard user={user} onClick={() => handleCardClick(user.href)} />
        </li>
      )),
    });
  }

  if (mappedOrgs.length > 0) {
    const visibleOrgs = filteredOrgs.slice(0, visibleCounts.organizations);
    const allLocalShown = visibleCounts.organizations >= filteredOrgs.length;
    categories.push({
      id: 'organizations',
      label: t('search.categories.organizations'),
      icon: Building2,
      count: filteredOrgs.length,
      activeFilter: 'all',
      onFilterChange: () => {},
      hasMore: visibleCounts.organizations < filteredOrgs.length || (allLocalShown && canContributorLoadMore),
      onLoadMore: handleLoadMore('organizations'),
      children: visibleOrgs.map(org => (
        <li key={org.id}>
          <OrgResultCard org={org} onClick={() => handleCardClick(org.href)} />
        </li>
      )),
    });
  }

  // Build sidebar categories (always all 5, even when count is 0)
  // Use unfiltered counts so sidebar reflects total results, not filtered subset
  const allSidebarCategories: SidebarCategory[] = [
    { id: 'spaces', label: t('search.categories.spaces'), icon: Globe, count: mappedSpaces.length },
    { id: 'posts', label: t('search.categories.posts'), icon: FileText, count: mappedPosts.length },
    { id: 'responses', label: t('search.categories.responses'), icon: MessageSquare, count: mappedResponses.length },
    { id: 'users', label: t('search.categories.users'), icon: Users, count: mappedUsers.length },
    { id: 'organizations', label: t('search.categories.organizations'), icon: Building2, count: mappedOrgs.length },
  ];

  // Scope is determined by the current route pathname. The overlay does not render
  // a scope dropdown because changing scope would require navigation, which the
  // overlay should not do. If inside a space, search is automatically scoped.

  return (
    <SearchOverlay
      isOpen={isOpen}
      onClose={closeSearch}
      state={overlayState}
      tags={searchTags}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onTagAdd={handleTagAdd}
      onTagRemove={handleTagRemove}
      maxTags={MAX_TAGS}
      categories={categories}
      allSidebarCategories={allSidebarCategories}
      disclaimer={t('search.disclaimer')}
      noResultsTerms={searchTags.join(', ')}
    />
  );
}

export default CrdSearchOverlay;
