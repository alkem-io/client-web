import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

// ─── Apollo hook mock ─────────────────────────────────────────────────────
const mockUseQuery = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceCollectionSubspacesQuery: (opts: unknown) => mockUseQuery(opts),
}));

import { useCrdSpaceSubspaces } from './useCrdSpaceSubspaces';

/** Minimal SubspaceCard-fragment-shaped subspace for the mapper + sorter. */
function subspace(id: string, displayName: string, pinned: boolean) {
  return {
    id,
    level: 1,
    visibility: SpaceVisibility.Active,
    pinned,
    sortOrder: 0,
    about: {
      profile: {
        displayName,
        tagline: '',
        url: `/s/${id}`,
        avatar: null,
        cardBanner: null,
        tagset: { tags: [] },
      },
      isContentPublic: true,
      membership: { myMembershipStatus: undefined, leadUsers: [], leadOrganizations: [] },
    },
  };
}

function dataWith(subspaces: ReturnType<typeof subspace>[]) {
  return { lookup: { callout: { id: 'callout-1', framing: { id: 'framing-1', subspaces } } } };
}

beforeEach(() => {
  mockUseQuery.mockReset();
});

describe('useCrdSpaceSubspaces', () => {
  it('maps the callout subspaces into SpaceCard props', () => {
    mockUseQuery.mockReturnValue({
      data: dataWith([subspace('a', 'Alpha', false), subspace('b', 'Beta', false)]),
      loading: false,
    });

    const { result } = renderHook(() => useCrdSpaceSubspaces('callout-1'));

    expect(result.current.subspaces.map(s => s.name)).toEqual(['Alpha', 'Beta']);
    expect(result.current.subspaces[0].href).toBe('/s/a');
  });

  it('renders pinned subspaces first (SC-003 — order/pins parity)', () => {
    // Server returns pinned-first already; the hook re-sorts idempotently in
    // alphabetical mode. Feed a pinned "Zeta" after unpinned entries and assert
    // it surfaces first with the pin indicator.
    mockUseQuery.mockReturnValue({
      data: dataWith([subspace('a', 'Alpha', false), subspace('z', 'Zeta', true), subspace('b', 'Beta', false)]),
      loading: false,
    });

    const { result } = renderHook(() => useCrdSpaceSubspaces('callout-1'));

    expect(result.current.subspaces.map(s => s.name)).toEqual(['Zeta', 'Alpha', 'Beta']);
    expect(result.current.subspaces[0].isPinned).toBe(true);
  });

  it('returns an empty list when the space has no subspaces (empty-state input)', () => {
    mockUseQuery.mockReturnValue({ data: dataWith([]), loading: false });

    const { result } = renderHook(() => useCrdSpaceSubspaces('callout-1'));

    expect(result.current.subspaces).toEqual([]);
  });

  it('skips the query when calloutId is undefined', () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: false });

    const { result } = renderHook(() => useCrdSpaceSubspaces(undefined));

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(result.current.subspaces).toEqual([]);
  });
});
