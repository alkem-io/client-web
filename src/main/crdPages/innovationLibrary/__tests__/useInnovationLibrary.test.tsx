/**
 * @vitest-environment jsdom
 *
 * `useInnovationLibrary` cursor-pagination contract (spec 103).
 *
 * Covers:
 *  - US1: bounded first page, total exposed, `hasMoreTemplates` from `pageInfo`,
 *    `onLoadMoreTemplates` fetches `after: endCursor`, stale-cursor recovery (FR-014).
 *  - US2: server-side type filter sent in the query variables; `'all'` ⇒ no filter (FR-004).
 *  - US3: packs first page bounded, `onLoadMorePacks` fetches `after: endCursor`;
 *    the legacy unpaginated `useInnovationLibraryQuery` is never called (FR-009).
 *  - FR-010 / SC-006: previewing a template from an appended page keeps the preview open
 *    and does not reset paging.
 *
 * The two paginated query hooks are mocked so we can assert the variables/`fetchMore`
 * calls directly; the relay merge itself is owned and tested by `paginationPolicy`.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TemplateType as GqlTemplateType } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

const useTemplatesPaginatedMock = vi.fn();
const usePacksPaginatedMock = vi.fn();
const getTemplateContentMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useInnovationLibraryTemplatesPaginatedQuery: (opts: unknown) => useTemplatesPaginatedMock(opts),
  useInnovationLibraryPacksPaginatedQuery: (opts: unknown) => usePacksPaginatedMock(opts),
  useTemplateContentLazyQuery: () => [getTemplateContentMock, { loading: false }],
}));

import { useInnovationLibrary } from '../useInnovationLibrary';

// ---- Fixtures ----

const templateRow = (id: string, type: GqlTemplateType = GqlTemplateType.Callout) => ({
  __typename: 'TemplateResult',
  template: {
    __typename: 'Template',
    id,
    type,
    profile: {
      __typename: 'Profile',
      id: `${id}-profile`,
      displayName: `Template ${id}`,
      description: '',
      defaultTagset: { __typename: 'Tagset', id: `${id}-tagset`, tags: [] },
      visual: { __typename: 'Visual', id: `${id}-visual`, uri: '' },
      url: `/template/${id}`,
    },
  },
  innovationPack: {
    __typename: 'InnovationPack',
    id: `pack-${id}`,
    profile: { __typename: 'Profile', id: `pack-${id}-p`, displayName: `Pack ${id}`, url: `/p/${id}` },
    provider: {
      __typename: 'Actor',
      id: `prov-${id}`,
      profile: { __typename: 'Profile', id: `prov-${id}-p`, displayName: `Provider ${id}`, url: `/o/${id}` },
    },
  },
});

const packRow = (id: string) => ({
  __typename: 'InnovationPack',
  id,
  profile: { __typename: 'Profile', id: `${id}-p`, displayName: `Pack ${id}`, description: '', url: `/p/${id}` },
  templatesSet: {
    __typename: 'TemplatesSet',
    id: `${id}-ts`,
    calloutTemplatesCount: 1,
    spaceTemplatesCount: 0,
    communityGuidelinesTemplatesCount: 0,
    postTemplatesCount: 0,
    whiteboardTemplatesCount: 0,
  },
  provider: {
    __typename: 'Actor',
    id: `${id}-prov`,
    profile: { __typename: 'Profile', id: `${id}-prov-p`, displayName: 'Org', url: '/o/org' },
  },
});

const templatesData = (
  results: ReturnType<typeof templateRow>[],
  total: number,
  hasNextPage: boolean,
  endCursor = 'tcursor'
) => ({
  platform: {
    __typename: 'Platform',
    id: 'platform',
    library: {
      __typename: 'Library',
      id: 'library',
      templatesPaginated: {
        __typename: 'PaginatedLibraryTemplateResults',
        total,
        templateResults: results,
        pageInfo: { __typename: 'PageInfo', startCursor: 'tstart', endCursor, hasNextPage, hasPreviousPage: false },
      },
    },
  },
});

const packsData = (
  packs: ReturnType<typeof packRow>[],
  total: number,
  hasNextPage: boolean,
  endCursor = 'pcursor'
) => ({
  platform: {
    __typename: 'Platform',
    id: 'platform',
    library: {
      __typename: 'Library',
      id: 'library',
      innovationPacksPaginated: {
        __typename: 'PaginatedInnovationPacks',
        total,
        innovationPacks: packs,
        pageInfo: { __typename: 'PageInfo', startCursor: 'pstart', endCursor, hasNextPage, hasPreviousPage: false },
      },
    },
  },
});

const templatesFetchMore = vi.fn();
const templatesRefetch = vi.fn();
const packsFetchMore = vi.fn();
const packsRefetch = vi.fn();

beforeEach(() => {
  useTemplatesPaginatedMock.mockReset();
  usePacksPaginatedMock.mockReset();
  getTemplateContentMock.mockReset();
  templatesFetchMore.mockReset().mockResolvedValue(undefined);
  templatesRefetch.mockReset().mockResolvedValue(undefined);
  packsFetchMore.mockReset().mockResolvedValue(undefined);
  packsRefetch.mockReset().mockResolvedValue(undefined);
  getTemplateContentMock.mockResolvedValue({ data: { lookup: { template: null } } });

  // Defaults: one bounded first page each, more available.
  useTemplatesPaginatedMock.mockReturnValue({
    data: templatesData([templateRow('t1'), templateRow('t2')], 7, true, 'tcursor1'),
    loading: false,
    fetchMore: templatesFetchMore,
    refetch: templatesRefetch,
  });
  usePacksPaginatedMock.mockReturnValue({
    data: packsData([packRow('p1'), packRow('p2')], 5, true, 'pcursor1'),
    loading: false,
    fetchMore: packsFetchMore,
    refetch: packsRefetch,
  });
});

afterEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// US1 — templates pagination
// ---------------------------------------------------------------------------

describe('useInnovationLibrary — templates (US1)', () => {
  test('requests a bounded first page (first=15) and exposes total + hasMore', () => {
    const { result } = renderHook(() => useInnovationLibrary());

    expect(useTemplatesPaginatedMock).toHaveBeenCalledWith({ variables: { first: 15, filter: undefined } });
    expect(result.current.templates).toHaveLength(2);
    expect(result.current.templatesTotal).toBe(7);
    expect(result.current.hasMoreTemplates).toBe(true);
  });

  test('onLoadMoreTemplates fetches the next page with after = endCursor', async () => {
    const { result } = renderHook(() => useInnovationLibrary());

    await act(async () => {
      await result.current.onLoadMoreTemplates();
    });

    expect(templatesFetchMore).toHaveBeenCalledWith({ variables: { first: 15, after: 'tcursor1' } });
  });

  test('hides Load More by reporting hasMoreTemplates=false on the last page', () => {
    useTemplatesPaginatedMock.mockReturnValue({
      data: templatesData([templateRow('t1')], 1, false, 'tcursorLast'),
      loading: false,
      fetchMore: templatesFetchMore,
      refetch: templatesRefetch,
    });
    const { result } = renderHook(() => useInnovationLibrary());
    expect(result.current.hasMoreTemplates).toBe(false);
  });

  test('stale cursor (fetchMore rejects) → silently refetches the first page (FR-014)', async () => {
    templatesFetchMore.mockRejectedValueOnce(new Error('EntityNotFoundException'));
    const { result } = renderHook(() => useInnovationLibrary());

    await act(async () => {
      await result.current.onLoadMoreTemplates();
    });

    expect(templatesFetchMore).toHaveBeenCalledTimes(1);
    expect(templatesRefetch).toHaveBeenCalledTimes(1);
  });

  test('first-page loading is surfaced as templatesLoading', () => {
    useTemplatesPaginatedMock.mockReturnValue({
      data: undefined,
      loading: true,
      fetchMore: templatesFetchMore,
      refetch: templatesRefetch,
    });
    const { result } = renderHook(() => useInnovationLibrary());
    expect(result.current.templatesLoading).toBe(true);
    expect(result.current.templates).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// US2 — server-side type filter
// ---------------------------------------------------------------------------

describe('useInnovationLibrary — server-side filter (US2)', () => {
  test("'all' sends no filter", () => {
    renderHook(() => useInnovationLibrary());
    expect(useTemplatesPaginatedMock).toHaveBeenCalledWith({ variables: { first: 15, filter: undefined } });
  });

  test('selecting a type sends { types: [...] } and re-queries', () => {
    const { result } = renderHook(() => useInnovationLibrary());

    act(() => {
      result.current.onChangeTypeFilter(['whiteboard']);
    });

    expect(useTemplatesPaginatedMock).toHaveBeenLastCalledWith({
      variables: { first: 15, filter: { types: [GqlTemplateType.Whiteboard] } },
    });
  });

  test('empty filtered result exposes total 0 and no more pages', () => {
    useTemplatesPaginatedMock.mockReturnValue({
      data: templatesData([], 0, false),
      loading: false,
      fetchMore: templatesFetchMore,
      refetch: templatesRefetch,
    });
    const { result } = renderHook(() => useInnovationLibrary());
    expect(result.current.templates).toHaveLength(0);
    expect(result.current.templatesTotal).toBe(0);
    expect(result.current.hasMoreTemplates).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// US3 — packs pagination + no legacy query
// ---------------------------------------------------------------------------

describe('useInnovationLibrary — packs (US3)', () => {
  test('requests a bounded first page and exposes total + hasMore', () => {
    const { result } = renderHook(() => useInnovationLibrary());
    expect(usePacksPaginatedMock).toHaveBeenCalledWith({ variables: { first: 15, filter: undefined } });
    expect(result.current.packs).toHaveLength(2);
    expect(result.current.packsTotal).toBe(5);
    expect(result.current.hasMorePacks).toBe(true);
  });

  test('onLoadMorePacks fetches the next page with after = endCursor', async () => {
    const { result } = renderHook(() => useInnovationLibrary());
    await act(async () => {
      await result.current.onLoadMorePacks();
    });
    expect(packsFetchMore).toHaveBeenCalledWith({ variables: { first: 15, after: 'pcursor1' } });
  });

  test('the legacy unpaginated useInnovationLibraryQuery is never used (FR-009)', () => {
    // The mock module deliberately does not expose `useInnovationLibraryQuery`; if the hook
    // referenced it, rendering would throw. A clean render proves the legacy path is gone.
    expect(() => renderHook(() => useInnovationLibrary())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// FR-010 / SC-006 — preview during paging
// ---------------------------------------------------------------------------

describe('useInnovationLibrary — preview during paging (FR-010)', () => {
  test('previewing a template from an appended page keeps the preview open and does not reset paging', async () => {
    // Simulate that a second page has already been appended (4 templates now loaded).
    useTemplatesPaginatedMock.mockReturnValue({
      data: templatesData(
        [templateRow('t1'), templateRow('t2'), templateRow('t3'), templateRow('t4')],
        7,
        true,
        'tcursor2'
      ),
      loading: false,
      fetchMore: templatesFetchMore,
      refetch: templatesRefetch,
    });

    const { result } = renderHook(() => useInnovationLibrary());
    const loadedBefore = result.current.templates.length;
    const hasMoreBefore = result.current.hasMoreTemplates;

    await act(async () => {
      result.current.onTemplatePreview('t4'); // a template from the appended page
    });

    await waitFor(() => expect(result.current.previewTemplate?.id).toBe('t4'));
    expect(getTemplateContentMock).toHaveBeenCalledTimes(1);
    // Paging is untouched by previewing.
    expect(result.current.templates).toHaveLength(loadedBefore);
    expect(result.current.hasMoreTemplates).toBe(hasMoreBefore);

    act(() => result.current.closePreview());
    expect(result.current.previewTemplate).toBeUndefined();
    expect(result.current.templates).toHaveLength(loadedBefore);
  });
});

// ---------------------------------------------------------------------------
// US4 — server-side text search (debounced; FR-015..FR-018)
// ---------------------------------------------------------------------------

describe('useInnovationLibrary — search (US4)', () => {
  test('a debounced packs term is sent as filter.searchTerm (FR-015)', async () => {
    const { result } = renderHook(() => useInnovationLibrary());

    act(() => result.current.onChangePacksSearch('design'));

    // The raw term updates immediately; the query re-fires only after the debounce settles.
    await waitFor(() =>
      expect(usePacksPaginatedMock).toHaveBeenLastCalledWith({
        variables: { first: 15, filter: { searchTerm: 'design' } },
      })
    );
  });

  test('a whitespace-only packs term is sent as no filter (FR-017)', async () => {
    const { result } = renderHook(() => useInnovationLibrary());

    act(() => result.current.onChangePacksSearch('   '));

    await waitFor(() =>
      expect(usePacksPaginatedMock).toHaveBeenLastCalledWith({
        variables: { first: 15, filter: undefined },
      })
    );
  });

  test('a templates term composes with the type filter as an AND (FR-016)', async () => {
    const { result } = renderHook(() => useInnovationLibrary());

    act(() => result.current.onChangeTypeFilter(['whiteboard']));
    act(() => result.current.onChangeTemplatesSearch('flow'));

    await waitFor(() =>
      expect(useTemplatesPaginatedMock).toHaveBeenLastCalledWith({
        variables: { first: 15, filter: { types: [GqlTemplateType.Whiteboard], searchTerm: 'flow' } },
      })
    );
  });

  test('a templates term with no type filter sends only searchTerm', async () => {
    const { result } = renderHook(() => useInnovationLibrary());

    act(() => result.current.onChangeTemplatesSearch('flow'));

    await waitFor(() =>
      expect(useTemplatesPaginatedMock).toHaveBeenLastCalledWith({
        variables: { first: 15, filter: { searchTerm: 'flow' } },
      })
    );
  });
});
