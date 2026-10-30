import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthorizationPrivilege,
  SearchCategory,
  SearchResultType,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';

type FakeSpace = {
  id: string;
  level: SpaceLevel;
  about: { isContentPublic: boolean };
  authorization: { myPrivileges: AuthorizationPrivilege[] };
};

const fake = vi.hoisted(() => {
  // A tiny server + store: the paginated spaces query re-renders when fetchMore appends a page.
  const listeners = new Set<() => void>();
  const state = {
    topLevel: [] as unknown[],
    subspacesOf: {} as Record<string, unknown[]>,
    // How many top-level spaces the paginated query has loaded; null until its first page.
    loadedCount: null as number | null,
    search: undefined as unknown,
  };
  return {
    state,
    notify: () => {
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    allSpacesFetchMore: vi.fn(),
    searchFetchMore: vi.fn(),
    subspacesQuery: vi.fn(),
  };
});

vi.mock('@/core/apollo/generated/apollo-hooks', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    useMySpacesExplorerPageQuery: () => ({ data: undefined, loading: false }),
    useSpaceExplorerMemberSpacesQuery: () => ({ data: undefined, loading: false }),
    useSpaceExplorerAllSpacesQuery: ({ variables, skip }: { variables: { first: number }; skip: boolean }) => {
      const loadedCount = useSyncExternalStore(fake.subscribe, () => fake.state.loadedCount);
      if (skip) return { data: undefined, loading: false, fetchMore: fake.allSpacesFetchMore };
      const spaces = fake.state.topLevel.slice(0, loadedCount ?? variables.first) as FakeSpace[];
      fake.allSpacesFetchMore.mockImplementation(async ({ variables: next }) => {
        const start = fake.state.topLevel.findIndex(space => (space as FakeSpace).id === next.after) + 1;
        fake.state.loadedCount = start + next.first;
        fake.notify();
      });
      const pageInfo = {
        endCursor: spaces[spaces.length - 1]?.id,
        hasNextPage: spaces.length < fake.state.topLevel.length,
      };
      return {
        data: { spacesPaginated: { spaces, pageInfo } },
        loading: false,
        fetchMore: fake.allSpacesFetchMore,
      };
    },
    useSpaceExplorerSearchQuery: ({ skip }: { skip: boolean }) => {
      const search = useSyncExternalStore(fake.subscribe, () => fake.state.search);
      return { data: skip ? undefined : search, loading: false, fetchMore: fake.searchFetchMore };
    },
    useSpaceExplorerSubspacesLazyQuery: () => [fake.subspacesQuery, { loading: false }],
  };
});
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: undefined, isAuthenticated: false, loading: false }),
}));

import useSpaceExplorer, { BATCH_SIZE } from './useSpaceExplorer';

const makeSpace = (id: string, level = SpaceLevel.L0, isContentPublic = true): FakeSpace => ({
  id,
  level,
  about: { isContentPublic },
  authorization: { myPrivileges: [AuthorizationPrivilege.Read] },
});

const topLevel = (count: number, isPublic: (index: number) => boolean = () => true) =>
  Array.from({ length: count }, (_, index) => makeSpace(`s${index}`, SpaceLevel.L0, isPublic(index)));

// Load more resolves only after React re-renders with the filled batch, so it can't be awaited inside act().
const loadMore = async (result: { current: ReturnType<typeof useSpaceExplorer> }) => {
  let done = false;
  act(() => {
    void result.current.fetchMore().then(() => {
      done = true;
    });
  });
  await waitFor(() => expect(done).toBe(true));
};

const ids = (spaces: { id: string }[] | undefined) => spaces?.map(space => space.id) ?? [];

const searchResult = (space: FakeSpace) => ({
  id: `r-${space.id}`,
  score: 1,
  terms: ['energie'],
  type: space.level === SpaceLevel.L0 ? SearchResultType.Space : SearchResultType.Subspace,
  space,
});

beforeEach(() => {
  vi.clearAllMocks();
  fake.state.topLevel = [];
  fake.state.subspacesOf = {};
  fake.state.loadedCount = null;
  fake.state.search = undefined;
  fake.subspacesQuery.mockImplementation(async ({ variables }: { variables: { IDs: string[] } }) => ({
    data: { spaces: variables.IDs.map(id => ({ id, subspaces: fake.state.subspacesOf[id] ?? [] })) },
  }));
});

describe('useSpaceExplorer browsing (spec 039 explore-filters-and-count)', () => {
  it('defaults to Spaces only and shows top-level spaces in full batches of 24, without fetching subspaces', async () => {
    fake.state.topLevel = topLevel(30);
    const { result } = renderHook(() => useSpaceExplorer());

    expect(result.current.typeFilter).toBe('spaces');
    expect(ids(result.current.spaces)).toHaveLength(BATCH_SIZE);
    expect(result.current.hasMore).toBe(true);

    await loadMore(result);

    expect(ids(result.current.spaces)).toHaveLength(30);
    expect(result.current.hasMore).toBe(false);
    expect(fake.allSpacesFetchMore).toHaveBeenCalledWith({ variables: { first: BATCH_SIZE, after: 's23' } });
    expect(fake.subspacesQuery).not.toHaveBeenCalled();
  });

  it('fills a "Subspaces only" batch from as many pages as it takes', async () => {
    fake.state.topLevel = topLevel(40);
    // 3 subspaces under every 4th space: 10 pages of 10 spaces hold 30 subspaces.
    for (let index = 0; index < 40; index += 4) {
      fake.state.subspacesOf[`s${index}`] = [1, 2, 3].map(n => makeSpace(`s${index}-${n}`, SpaceLevel.L1));
    }
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.onTypeFilterChange('subspaces'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toHaveLength(BATCH_SIZE);
    expect(result.current.spaces?.every(space => space.level === SpaceLevel.L1)).toBe(true);
    expect(result.current.hasMore).toBe(true);

    await loadMore(result);

    expect(ids(result.current.spaces)).toHaveLength(30);
    expect(result.current.hasMore).toBe(false);
  });

  it('fills a "Private only" batch from as many pages as it takes', async () => {
    fake.state.topLevel = topLevel(100, index => index % 4 !== 0);
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.onPrivacyFilterChange('private'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toHaveLength(BATCH_SIZE);
    expect(result.current.spaces?.every(space => !space.about.isContentPublic)).toBe(true);
  });

  it('shows "All" in batches of 24 too, each space followed by its subspaces', async () => {
    fake.state.topLevel = topLevel(10);
    for (const space of fake.state.topLevel as FakeSpace[]) {
      fake.state.subspacesOf[space.id] = [1, 2].map(n => makeSpace(`${space.id}-${n}`, SpaceLevel.L1));
    }
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.onTypeFilterChange('all'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces).slice(0, 4)).toEqual(['s0', 's0-1', 's0-2', 's1']);
    expect(ids(result.current.spaces)).toHaveLength(BATCH_SIZE);

    await loadMore(result);
    expect(ids(result.current.spaces)).toHaveLength(30);
  });

  it('does not carry a failed page over to the next filter change', async () => {
    // No private space in the first page of 24, so "Private only" must fetch the next page — which fails once.
    fake.state.topLevel = topLevel(100, index => index < 30 || index % 2 === 0);
    fake.allSpacesFetchMore.mockImplementationOnce(() => Promise.reject(new Error('network')));
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.onPrivacyFilterChange('private'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toEqual([]);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.onPrivacyFilterChange('private'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toHaveLength(BATCH_SIZE);
  });

  it('sizes batches in whole rows of the grid, and re-cuts them when the row size changes', async () => {
    fake.state.topLevel = topLevel(100);
    const { result } = renderHook(() => useSpaceExplorer());

    // 5 cards per row (a 1920px screen): 5 rows of 5, not 24.
    act(() => result.current.onColumnsChange(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toHaveLength(25);

    await loadMore(result);
    expect(ids(result.current.spaces)).toHaveLength(50);

    // Resized to 3 per row: still 2 batches, now of 8 rows of 3.
    act(() => result.current.onColumnsChange(3));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.spaces)).toHaveLength(48);
  });

  it('never moves a space ahead of one whose subspaces are still loading', async () => {
    fake.state.topLevel = topLevel(3);
    // s1 cannot be read by this user, so it never waits for subspaces.
    (fake.state.topLevel[1] as FakeSpace).authorization.myPrivileges = [];
    fake.state.subspacesOf.s0 = [makeSpace('s0-1', SpaceLevel.L1)];
    let respond: () => void = () => {};
    const defaultSubspaces = fake.subspacesQuery.getMockImplementation()!;
    fake.subspacesQuery.mockImplementation(
      args => new Promise(resolve => (respond = () => resolve(defaultSubspaces(args))))
    );
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.onTypeFilterChange('all'));
    await waitFor(() => expect(fake.subspacesQuery).toHaveBeenCalled());
    const whileLoading = ids(result.current.spaces);

    await act(async () => respond());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(ids(result.current.spaces)).toEqual(['s0', 's0-1', 's1', 's2']);
    expect(ids(result.current.spaces).slice(0, whileLoading.length)).toEqual(whileLoading);
  });
});

describe('useSpaceExplorer search (spec 039 explore-filters-and-count)', () => {
  it('lists subspaces too while the user has not picked a Type', () => {
    fake.state.search = {
      search: {
        spaceResults: {
          cursor: null,
          total: 2,
          results: [searchResult(makeSpace('a')), searchResult(makeSpace('a-1', SpaceLevel.L1))],
        },
      },
    };
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.setSearchTerms(['energie']));

    expect(result.current.typeFilter).toBe('all');
    expect(ids(result.current.spaces)).toEqual(['a', 'a-1']);
  });

  it('fetches the next search page with the cursor when Load more needs it', async () => {
    const first = Array.from({ length: BATCH_SIZE }, (_, index) => searchResult(makeSpace(`a${index}`)));
    fake.state.search = { search: { spaceResults: { cursor: 'c1', total: 30, results: first } } };
    fake.searchFetchMore.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.setSearchTerms(['energie']));
    expect(result.current.hasMore).toBe(true);

    act(() => void result.current.fetchMore());

    await waitFor(() => expect(fake.searchFetchMore).toHaveBeenCalledTimes(1));
    const { variables, updateQuery } = fake.searchFetchMore.mock.calls[0][0];
    expect(variables.searchData).toMatchObject({
      terms: ['energie'],
      filters: [{ category: SearchCategory.Spaces, size: BATCH_SIZE, cursor: 'c1' }],
    });

    const next = { search: { spaceResults: { cursor: null, total: 30, results: [searchResult(makeSpace('b'))] } } };
    const merged = updateQuery(fake.state.search, { fetchMoreResult: next });
    expect(merged.search.spaceResults.results).toHaveLength(BATCH_SIZE + 1);
    expect(merged.search.spaceResults.cursor).toBeNull();
  });

  it('offers nothing more once the search returns no cursor', () => {
    fake.state.search = {
      search: { spaceResults: { cursor: null, total: 1, results: [searchResult(makeSpace('a'))] } },
    };
    const { result } = renderHook(() => useSpaceExplorer());

    act(() => result.current.setSearchTerms(['energie']));

    expect(result.current.hasMore).toBe(false);
  });
});
