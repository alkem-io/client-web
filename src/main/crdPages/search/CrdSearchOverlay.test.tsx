import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CrdSearchOverlay } from './CrdSearchOverlay';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && typeof opts === 'object' ? `${key}::${JSON.stringify(opts)}` : key,
  }),
}));

const useUrlResolverMock = vi.fn();
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => useUrlResolverMock(),
}));

const useSpaceAboutBaseQueryMock = vi.fn();
const useSearchQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceAboutBaseQuery: (args: unknown) => useSpaceAboutBaseQueryMock(args),
  useSearchQuery: (args: unknown) => useSearchQueryMock(args),
}));

vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  SearchCategory: {
    Spaces: 'SPACES',
    CollaborationTools: 'COLLABORATION_TOOLS',
    Framings: 'FRAMINGS',
    Contributions: 'CONTRIBUTIONS',
    Contributors: 'CONTRIBUTORS',
  },
  SearchResultType: {
    Space: 'SPACE',
    Subspace: 'SUBSPACE',
    Callout: 'CALLOUT',
    Whiteboard: 'WHITEBOARD',
    Memo: 'MEMO',
    Post: 'POST',
    User: 'USER',
    Organization: 'ORGANIZATION',
  },
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => vi.fn(),
}));

const useSearchMock = vi.fn();
vi.mock('../../search/SearchContext', () => ({
  useSearch: () => useSearchMock(),
}));

// Capture every render of <SearchOverlay> as a stub so we can assert on its props.
const searchOverlayPropsLog: Array<Record<string, unknown>> = [];
vi.mock('@/crd/components/search/SearchOverlay', () => ({
  SearchOverlay: (props: Record<string, unknown>) => {
    searchOverlayPropsLog.push(props);
    return null;
  },
}));

// The result-card components are not exercised by these tests; stub them.
vi.mock('@/crd/components/search/OrgResultCard', () => ({ OrgResultCard: () => null }));
vi.mock('@/crd/components/search/PostResultCard', () => ({ PostResultCard: () => null }));
vi.mock('@/crd/components/search/ResponseResultCard', () => ({ ResponseResultCard: () => null }));
vi.mock('@/crd/components/search/UserResultCard', () => ({ UserResultCard: () => null }));
vi.mock('@/crd/components/space/SpaceCard', () => ({ SpaceCard: () => null }));

// ---- Helpers ----

const SPACE_A_ID = 'space-uuid-A';
const SPACE_A_DISPLAY_NAME = 'Space A';

function setOnSpaceA() {
  useUrlResolverMock.mockReturnValue({ levelZeroSpaceId: SPACE_A_ID, loading: false });
  useSpaceAboutBaseQueryMock.mockReturnValue({
    data: { lookup: { space: { about: { profile: { displayName: SPACE_A_DISPLAY_NAME } } } } },
    loading: false,
  });
}

function setOffSpace() {
  useUrlResolverMock.mockReturnValue({ levelZeroSpaceId: undefined, loading: false });
  useSpaceAboutBaseQueryMock.mockReturnValue({ data: undefined, loading: false });
}

function setSearchOpen(opts: { isOpen?: boolean; initialQuery?: string | null } = {}) {
  useSearchMock.mockReturnValue({
    isOpen: opts.isOpen ?? true,
    closeSearch: vi.fn(),
    initialQuery: opts.initialQuery ?? null,
    clearInitialQuery: vi.fn(),
  });
}

function setSearchQueryEmpty() {
  useSearchQueryMock.mockReturnValue({ data: undefined, loading: false, fetchMore: vi.fn() });
}

function lastSearchQueryArgs() {
  return useSearchQueryMock.mock.calls[useSearchQueryMock.mock.calls.length - 1]?.[0];
}

function lastOverlayProps() {
  return searchOverlayPropsLog[searchOverlayPropsLog.length - 1];
}

// ---- Tests ----

describe('CrdSearchOverlay scope-switching integration', () => {
  beforeEach(() => {
    searchOverlayPropsLog.length = 0;
    useUrlResolverMock.mockReset();
    useSpaceAboutBaseQueryMock.mockReset();
    useSearchQueryMock.mockReset();
    useSearchMock.mockReset();
    setSearchQueryEmpty();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('on a Space page, default scope is the current Space and searchInSpaceFilter passes the level-zero id', () => {
    setOnSpaceA();
    setSearchOpen();

    render(<CrdSearchOverlay />);

    const args = lastSearchQueryArgs() as { variables: { searchData: { searchInSpaceFilter?: string } } };
    expect(args.variables.searchData.searchInSpaceFilter).toBe(SPACE_A_ID);

    const overlayProps = lastOverlayProps();
    expect(overlayProps).toBeDefined();
    expect(overlayProps?.scope).toEqual({
      currentSpaceName: SPACE_A_DISPLAY_NAME,
      activeScope: SPACE_A_DISPLAY_NAME,
    });
    expect(typeof overlayProps?.onScopeChange).toBe('function');
  });

  test('switching scope to "all" causes searchInSpaceFilter to become undefined and onSearchAll to disappear', () => {
    setOnSpaceA();
    setSearchOpen();

    render(<CrdSearchOverlay />);

    const initialOverlay = lastOverlayProps();
    // Sanity: while scoped to Space, the recovery callback IS available.
    expect(typeof initialOverlay?.onSearchAll).toBe('function');

    // Simulate the user selecting "all" via the onScopeChange callback. The state
    // update triggers a re-render; wrap in act() so React flushes before we assert.
    const onScopeChange = initialOverlay?.onScopeChange as (next: 'all' | string) => void;
    act(() => {
      onScopeChange('all');
    });

    const argsAfter = lastSearchQueryArgs() as { variables: { searchData: { searchInSpaceFilter?: string } } };
    expect(argsAfter.variables.searchData.searchInSpaceFilter).toBeUndefined();

    const finalOverlay = lastOverlayProps();
    // FR-016: when activeScope is 'all', onSearchAll MUST NOT be passed.
    expect(finalOverlay?.onSearchAll).toBeUndefined();
    expect((finalOverlay?.scope as { activeScope: string } | undefined)?.activeScope).toBe('all');
  });

  test('off-Space page renders no scope dropdown and search runs platform-wide', () => {
    setOffSpace();
    // Pre-fill a tag so the query's tags-empty skip condition is bypassed.
    setSearchOpen({ initialQuery: 'wb' });

    render(<CrdSearchOverlay />);

    const args = lastSearchQueryArgs() as {
      variables: { searchData: { searchInSpaceFilter?: string } };
      skip: boolean;
    };
    expect(args.variables.searchData.searchInSpaceFilter).toBeUndefined();
    // FR-004: search MUST fire on non-Space pages. Regression guard for the bug
    // where the resolver-provider isn't mounted on /home and the empty context's
    // loading: true would have permanently gated the query.
    expect(args.skip).toBe(false);

    const overlayProps = lastOverlayProps();
    expect(overlayProps?.scope).toBeUndefined();
    expect(overlayProps?.onScopeChange).toBeUndefined();
    expect(overlayProps?.onSearchAll).toBeUndefined();
  });

  test('off-Space page: even if UrlResolverProvider is not mounted (default empty context with loading: true), search still fires', () => {
    // Simulate the exact production scenario: on /home, useUrlResolver() returns
    // the provider's default emptyResult value, where loading is true even though
    // there is no Space.
    useUrlResolverMock.mockReturnValue({ levelZeroSpaceId: undefined, loading: true });
    useSpaceAboutBaseQueryMock.mockReturnValue({ data: undefined, loading: false });
    setSearchOpen({ initialQuery: 'wb' });

    render(<CrdSearchOverlay />);

    const args = lastSearchQueryArgs() as {
      variables: { searchData: { searchInSpaceFilter?: string } };
      skip: boolean;
    };
    expect(args.skip).toBe(false);
    expect(args.variables.searchData.searchInSpaceFilter).toBeUndefined();
  });

  test('overlay close + reopen restores the default scope (current Space) — FR-017', () => {
    setOnSpaceA();
    // First open: default to 'space'.
    setSearchOpen({ isOpen: true });
    const { rerender } = render(<CrdSearchOverlay />);

    // User switches to 'all'.
    const onScopeChange = lastOverlayProps()?.onScopeChange as (next: 'all' | string) => void;
    act(() => {
      onScopeChange('all');
    });

    // Close the overlay.
    setSearchOpen({ isOpen: false });
    rerender(<CrdSearchOverlay />);

    // Reopen.
    setSearchOpen({ isOpen: true });
    rerender(<CrdSearchOverlay />);

    const overlayProps = lastOverlayProps();
    // The reset-on-close effect must have set activeScope back to 'space' (because levelZeroSpaceId is truthy).
    expect((overlayProps?.scope as { activeScope: string } | undefined)?.activeScope).toBe(SPACE_A_DISPLAY_NAME);
    const args = lastSearchQueryArgs() as { variables: { searchData: { searchInSpaceFilter?: string } } };
    expect(args.variables.searchData.searchInSpaceFilter).toBe(SPACE_A_ID);
  });

  test('while Space context is loading, search query is skipped and dropdown is hidden — FR-019', () => {
    useUrlResolverMock.mockReturnValue({ levelZeroSpaceId: SPACE_A_ID, loading: false });
    useSpaceAboutBaseQueryMock.mockReturnValue({ data: undefined, loading: true }); // about query in flight
    setSearchOpen();

    render(<CrdSearchOverlay />);

    const args = lastSearchQueryArgs() as { skip: boolean };
    expect(args.skip).toBe(true);

    const overlayProps = lastOverlayProps();
    // While loading, scope MUST NOT be passed to the overlay (no stale name).
    expect(overlayProps?.scope).toBeUndefined();
  });
});
