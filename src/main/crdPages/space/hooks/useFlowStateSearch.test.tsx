import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useFlowStateSearch } from './useFlowStateSearch';

// ---- Mocks ----

// react-intersection-observer: a controllable sentinel so individual tests can
// decide whether the infinite-scroll effect should fire.
let mockInView = false;
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: mockInView }),
}));

const useFlowStateSearchQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useFlowStateSearchQuery: (args: unknown) => useFlowStateSearchQueryMock(args),
}));

// Mirror the enum shapes the hook reads so the variables it builds are inspectable.
vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  SearchCategory: { CollaborationTools: 'COLLABORATION_TOOLS' },
  SearchResultType: { Callout: 'CALLOUT' },
}));

type QueryArgs = {
  variables: {
    searchData: {
      terms: string[];
      searchInFlowStateFilter?: string;
      searchInSpaceFilter?: string;
      foldCalloutResources?: boolean;
      filters: Array<{ cursor?: string; size: number; category: string }>;
    };
  };
  skip?: boolean;
};

const FLOW_STATE = 'flow-state-uuid';
const SPACE = 'space-uuid';

const calloutResult = (id: string) => ({ id, type: 'CALLOUT', score: 1, terms: [] });

beforeEach(() => {
  useFlowStateSearchQueryMock.mockReset();
  mockInView = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useFlowStateSearch', () => {
  // FR-007/FR-012: the flow-state UUID rides every request; page 1 has no cursor;
  // page size is 10.
  test('issues a scoped page-1 request with the flow-state UUID (FR-012)', () => {
    useFlowStateSearchQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      fetchMore: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    });

    renderHook(() => useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] }));

    const args = useFlowStateSearchQueryMock.mock.calls.at(-1)?.[0] as QueryArgs;
    expect(args.variables.searchData.searchInFlowStateFilter).toBe(FLOW_STATE);
    expect(args.variables.searchData.searchInSpaceFilter).toBe(SPACE);
    expect(args.variables.searchData.terms).toEqual(['governance']);
    // Fold framing resources and contributions up to the matching callout.
    expect(args.variables.searchData.foldCalloutResources).toBe(true);
    expect(args.variables.searchData.filters[0].cursor).toBeUndefined();
    expect(args.variables.searchData.filters[0].size).toBe(10);
    expect(args.skip).toBe(false);
  });

  // FR-022: any change to the term/tag set starts a fresh page-1 request — the
  // re-issued variables carry the NEW terms and no cursor.
  test('term/tag change re-issues a fresh page-1 query with the new terms (FR-022)', () => {
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: 'c1' } } },
      loading: false,
      error: undefined,
      fetchMore: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    });

    const { rerender } = renderHook(
      (props: { terms: string[] }) => useFlowStateSearch({ flowStateID: FLOW_STATE, terms: props.terms }),
      { initialProps: { terms: ['governance'] } }
    );

    // Adding a tag pill changes the term set → a new page-1 request.
    rerender({ terms: ['governance', 'budget'] });

    const lastArgs = useFlowStateSearchQueryMock.mock.calls.at(-1)?.[0] as QueryArgs;
    expect(lastArgs.variables.searchData.terms).toEqual(['governance', 'budget']);
    // Page 1 always — no cursor carried over from the prior term set.
    expect(lastArgs.variables.searchData.filters[0].cursor).toBeUndefined();
  });

  // FR-022 latest-wins: a fetchMore page that resolves AFTER the term/tag set has
  // changed must be discarded — updateQuery returns prev unchanged, never merging
  // a stale page into the new query.
  test('discards an in-flight page when the term set changed mid-flight (FR-022 latest-wins)', () => {
    let capturedUpdateQuery: ((prev: unknown, opts: { fetchMoreResult: unknown }) => unknown) | undefined;
    let capturedFetchMoreArgs: { variables: QueryArgs['variables'] } | undefined;

    const fetchMore = vi.fn(
      (opts: {
        variables: QueryArgs['variables'];
        updateQuery: (prev: unknown, o: { fetchMoreResult: unknown }) => unknown;
      }) => {
        // Capture only the FIRST page's updateQuery — the one tied to the prior
        // term set whose result must later be discarded.
        if (!capturedUpdateQuery) {
          capturedUpdateQuery = opts.updateQuery;
          capturedFetchMoreArgs = opts;
        }
        return Promise.resolve();
      }
    );

    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: 'c1' } } },
      loading: false,
      error: undefined,
      fetchMore,
      refetch: vi.fn(),
    });

    // Sentinel in view → the infinite-scroll effect fires fetchMore (page 2).
    mockInView = true;
    const { rerender } = renderHook(
      (props: { terms: string[] }) =>
        useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: props.terms }),
      { initialProps: { terms: ['governance'] } }
    );

    expect(fetchMore).toHaveBeenCalledTimes(1);
    expect(capturedUpdateQuery).toBeDefined();
    // The Space scope rides fetchMore's variables too, not only the page-1 query.
    expect(capturedFetchMoreArgs?.variables.searchData.searchInSpaceFilter).toBe(SPACE);

    const prev = { search: { calloutResults: { results: [calloutResult('a')], cursor: 'c1' } } };
    const stalePage = { search: { calloutResults: { results: [calloutResult('b')], cursor: 'c2' } } };

    // While the page is in flight, the user changes the term set (page-1 reset).
    // Take the sentinel out of view so the rerender does not fire a second page;
    // wrap in act so the ref-sync effect flushes before we drive updateQuery.
    mockInView = false;
    act(() => {
      rerender({ terms: ['budget'] });
    });

    // The in-flight page now belongs to the PRIOR term set → it must be dropped.
    // biome-ignore lint/style/noNonNullAssertion: asserted defined above
    const merged = capturedUpdateQuery!(prev, { fetchMoreResult: stalePage }) as typeof prev;
    expect(merged.search.calloutResults.results).toHaveLength(1);
    expect(merged.search.calloutResults.results[0].id).toBe('a');
  });

  // FR-006: a short page still carries a cursor (the server only drops it on
  // the request after the last page), so it is confirmed eagerly — without the
  // sentinel — and the "N+" count can settle to "N" on a tall, unscrolled list.
  test('a short page with a cursor is confirmed eagerly, without the sentinel (FR-006)', () => {
    const fetchMore = vi.fn((_opts: { variables: QueryArgs['variables'] }) => Promise.resolve());
    useFlowStateSearchQueryMock.mockReturnValue({
      data: {
        search: { calloutResults: { results: [calloutResult('a'), calloutResult('b')], cursor: 'c1' } },
      },
      loading: false,
      error: undefined,
      fetchMore,
      refetch: vi.fn(),
    });

    mockInView = false;
    renderHook(() => useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] }));

    expect(fetchMore).toHaveBeenCalledTimes(1);
    expect(fetchMore.mock.calls[0][0].variables.searchData.filters[0].cursor).toBe('c1');
  });

  // A page result as the Apollo hook reports it. `loading` is only raised by
  // the deadlock test to mimic a stuck networkStatus.
  const queryResult = (ids: string[], cursor: string | undefined, loading = false) => ({
    data: { search: { calloutResults: { results: ids.map(calloutResult), cursor } } },
    loading,
    error: undefined,
    refetch: vi.fn(),
  });

  // A `fetchMore` mock that serves the given pages in order and — as Apollo
  // does on success — swaps the hook's reported data to the merged page before
  // the promise settles. Any call beyond the scripted pages rejects.
  const pagedFetchMore = (pages: Array<{ ids: string[]; cursor: string | undefined }>) =>
    vi.fn((_opts: { variables: QueryArgs['variables'] }) => {
      const next = pages.shift();
      if (!next) {
        return Promise.reject(new Error('unscripted page'));
      }
      useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(next.ids, next.cursor), fetchMore });
      return Promise.resolve();
    });
  let fetchMore: ReturnType<typeof pagedFetchMore>;

  const flush = () => act(() => new Promise<void>(resolve => setTimeout(resolve, 0)));

  // Regression: the server emits a cursor for every non-empty folded page and
  // folding thins pages below PAGE_SIZE, so an uncapped confirmation chained
  // sequential requests on a single keystroke. Exactly one eager confirmation
  // per term/tag set: page-1 query + one fetchMore = 2 requests, no matter how
  // many short pages follow; later pages are sentinel-driven.
  test('consecutive short pages with cursors issue exactly one eager fetchMore (page-1 + 1 = 2 requests)', async () => {
    // Page 1 is short with a cursor; its confirmation is short with a cursor
    // again; so is the page after that. Only the sentinel may ask for it.
    fetchMore = pagedFetchMore([
      { ids: ['a', 'b', 'c'], cursor: 'c2' },
      { ids: ['a', 'b', 'c', 'd'], cursor: undefined },
      { ids: ['x'], cursor: undefined },
    ]);
    useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(['a', 'b'], 'c1'), fetchMore });

    mockInView = false;
    const { result, rerender } = renderHook(
      (props: { terms: string[] }) =>
        useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: props.terms }),
      { initialProps: { terms: ['governance'] } }
    );
    expect(fetchMore).toHaveBeenCalledTimes(1);
    expect(fetchMore.mock.calls[0][0].variables.searchData.filters[0].cursor).toBe('c1');

    // The confirmation lands as another short page with a cursor: no further
    // eager request — the count honestly stays "3+" until the sentinel enters.
    await flush();
    expect(result.current.results).toHaveLength(3);
    expect(result.current.hasMore).toBe(true);
    expect(fetchMore).toHaveBeenCalledTimes(1);

    // Further pages are sentinel-driven: entering view loads the next one.
    mockInView = true;
    await act(async () => {
      rerender({ terms: ['governance'] });
    });
    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(fetchMore.mock.calls[1][0].variables.searchData.filters[0].cursor).toBe('c2');
    await flush();
    expect(result.current.results).toHaveLength(4);
    expect(result.current.hasMore).toBe(false);

    // A new term/tag set gets a fresh single allowance.
    mockInView = false;
    await act(async () => {
      useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(['x'], 'd1'), fetchMore });
      rerender({ terms: ['budget'] });
    });
    expect(fetchMore).toHaveBeenCalledTimes(3);
    expect(fetchMore.mock.calls[2][0].variables.searchData.filters[0].cursor).toBe('d1');
  });

  // Regression: with Apollo 3.x a rejected fetchMore leaves the query at
  // networkStatus=fetchMore (`loading` true) indefinitely. Paging must not gate
  // on that flag, or one transient failure would block every later page.
  test('a rejected fetchMore does not block later pages: the next sentinel entry retries and the page loads', async () => {
    const fullPage = Array.from({ length: 10 }, (_, i) => `r${i}`);
    fetchMore = pagedFetchMore([{ ids: [...fullPage, 'p2'], cursor: undefined }]).mockRejectedValueOnce(
      new Error('network')
    );
    useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(fullPage, 'c1'), fetchMore });

    mockInView = true;
    const { result, rerender } = renderHook(() =>
      useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] })
    );
    expect(fetchMore).toHaveBeenCalledTimes(1);

    // Let the rejection settle; Apollo now reports `loading: true` for good.
    await act(async () => {
      useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(fullPage, 'c1', true), fetchMore });
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.appending).toBe(false);
    expect(result.current.results).toHaveLength(10);
    // No tight loop: the failed cursor is not retried while nothing changed.
    expect(fetchMore).toHaveBeenCalledTimes(1);

    // The sentinel leaves and re-enters view → the same cursor is retried…
    mockInView = false;
    await act(async () => {
      rerender();
    });
    mockInView = true;
    await act(async () => {
      rerender();
    });
    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(fetchMore.mock.calls[1][0].variables.searchData.filters[0].cursor).toBe('c1');

    // …and the second page loads.
    await flush();
    expect(result.current.results).toHaveLength(11);
    expect(result.current.appending).toBe(false);
  });

  // A failure while the sentinel is OUT of view (an eager short-page
  // confirmation) must be retried on the sentinel's FIRST entry — not only
  // after a leave-and-re-enter cycle.
  test("a failed eager confirmation is retried on the sentinel's first entry", async () => {
    fetchMore = pagedFetchMore([{ ids: ['a', 'b'], cursor: undefined }]).mockRejectedValueOnce(new Error('network'));
    useFlowStateSearchQueryMock.mockReturnValue({ ...queryResult(['a'], 'c1'), fetchMore });

    mockInView = false;
    const { result, rerender } = renderHook(() =>
      useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] })
    );
    expect(fetchMore).toHaveBeenCalledTimes(1);
    await flush();
    expect(fetchMore).toHaveBeenCalledTimes(1);

    mockInView = true;
    await act(async () => {
      rerender();
    });
    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(fetchMore.mock.calls[1][0].variables.searchData.filters[0].cursor).toBe('c1');
    await flush();
    expect(result.current.results).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });

  test('a full page waits for the sentinel before loading the next one (FR-013)', () => {
    const fetchMore = vi.fn(() => Promise.resolve());
    const fullPage = Array.from({ length: 10 }, (_, i) => calloutResult(`r${i}`));
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: fullPage, cursor: 'c1' } } },
      loading: false,
      error: undefined,
      fetchMore,
      refetch: vi.fn(),
    });

    mockInView = false;
    const { rerender } = renderHook(() =>
      useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] })
    );
    expect(fetchMore).not.toHaveBeenCalled();

    mockInView = true;
    rerender();
    expect(fetchMore).toHaveBeenCalledTimes(1);
  });

  test('a short page without a cursor is the end: nothing is fetched (FR-013)', () => {
    const fetchMore = vi.fn(() => Promise.resolve());
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: undefined } } },
      loading: false,
      error: undefined,
      fetchMore,
      refetch: vi.fn(),
    });

    mockInView = false;
    const { result } = renderHook(() =>
      useFlowStateSearch({ flowStateID: FLOW_STATE, spaceID: SPACE, terms: ['governance'] })
    );
    expect(fetchMore).not.toHaveBeenCalled();
    expect(result.current.hasMore).toBe(false);
  });

  // FR-013: end-of-results is driven off cursor presence (no count). With a
  // cursor present, more pages may exist; absent, the list is complete.
  test('hasMore is driven off cursor presence, not a count (FR-013)', () => {
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: undefined } } },
      loading: false,
      error: undefined,
      fetchMore: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useFlowStateSearch({ flowStateID: FLOW_STATE, terms: ['governance'] }));

    expect(result.current.hasMore).toBe(false);
    expect(result.current.status).toBe('results');
  });

  // FR-021: a hard failure with nothing loaded is the error state; a failure
  // with prior results keeps them (status stays 'results').
  test('error with no results is error state; error with prior results keeps them (FR-021)', () => {
    useFlowStateSearchQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('boom'),
      fetchMore: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    });

    const { result, rerender } = renderHook(() =>
      useFlowStateSearch({ flowStateID: FLOW_STATE, terms: ['governance'] })
    );
    expect(result.current.status).toBe('error');

    // Now a failure but with prior results present → keep them, not error.
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: 'c1' } } },
      loading: false,
      error: new Error('boom'),
      fetchMore: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    });
    rerender();
    expect(result.current.status).toBe('results');
    expect(result.current.results).toHaveLength(1);
  });
});
