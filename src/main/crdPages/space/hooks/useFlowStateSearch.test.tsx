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
      filters: Array<{ cursor?: string; size: number; category: string }>;
    };
  };
  skip?: boolean;
};

const FLOW_STATE = 'flow-state-uuid';

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
      fetchMore: vi.fn(),
      refetch: vi.fn(),
    });

    renderHook(() => useFlowStateSearch({ flowStateID: FLOW_STATE, terms: ['governance'] }));

    const args = useFlowStateSearchQueryMock.mock.calls.at(-1)?.[0] as QueryArgs;
    expect(args.variables.searchData.searchInFlowStateFilter).toBe(FLOW_STATE);
    expect(args.variables.searchData.terms).toEqual(['governance']);
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
      fetchMore: vi.fn(),
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

    const fetchMore = vi.fn((opts: { updateQuery: (prev: unknown, o: { fetchMoreResult: unknown }) => unknown }) => {
      // Capture only the FIRST page's updateQuery — the one tied to the prior
      // term set whose result must later be discarded.
      if (!capturedUpdateQuery) {
        capturedUpdateQuery = opts.updateQuery;
      }
      return Promise.resolve();
    });

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
      (props: { terms: string[] }) => useFlowStateSearch({ flowStateID: FLOW_STATE, terms: props.terms }),
      { initialProps: { terms: ['governance'] } }
    );

    expect(fetchMore).toHaveBeenCalledTimes(1);
    expect(capturedUpdateQuery).toBeDefined();

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

  // FR-013: end-of-results is driven off cursor presence (no count). With a
  // cursor present, more pages may exist; absent, the list is complete.
  test('hasMore is driven off cursor presence, not a count (FR-013)', () => {
    useFlowStateSearchQueryMock.mockReturnValue({
      data: { search: { calloutResults: { results: [calloutResult('a')], cursor: undefined } } },
      loading: false,
      error: undefined,
      fetchMore: vi.fn(),
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
      fetchMore: vi.fn(),
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
      fetchMore: vi.fn(),
      refetch: vi.fn(),
    });
    rerender();
    expect(result.current.status).toBe('results');
    expect(result.current.results).toHaveLength(1);
  });
});
