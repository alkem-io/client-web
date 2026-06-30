import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType, ContributorCollectionView } from '@/core/apollo/generated/graphql-schema';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockUseConfigQuery = vi.fn();
const mockFetchByType = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useContributorCollectionConfigQuery: (opts: unknown) => mockUseConfigQuery(opts),
  useContributorCollectionByTypeLazyQuery: () => [mockFetchByType],
}));

import { useCrdSpaceContributors } from './useCrdSpaceContributors';

// Config resolves to a single selected type (user), default view list — enough
// for the eager auto-load to target the `user` type.
const configData = {
  lookup: {
    callout: {
      id: 'callout-1',
      framing: {
        id: 'framing-1',
        contributorCounts: { users: 1, organizations: 0, virtualContributors: 0 },
      },
      settings: {
        framing: {
          contributors: {
            contributorTypes: [ActorType.User],
            defaultContributorType: ActorType.User,
            defaultView: ContributorCollectionView.List,
          },
        },
      },
    },
  },
};

beforeEach(() => {
  mockUseConfigQuery.mockReset().mockReturnValue({ data: configData, loading: false });
  mockFetchByType.mockReset();
});

describe('useCrdSpaceContributors — eager default-type load', () => {
  it('attempts the default type exactly once and does NOT loop when its fetch fails', async () => {
    mockFetchByType.mockRejectedValue(new Error('network'));

    renderHook(() => useCrdSpaceContributors('callout-1'));

    // Wait for the first (failing) attempt to fire.
    await waitFor(() => expect(mockFetchByType).toHaveBeenCalled());
    // Give the rejection's catch/finally re-render time to (wrongly) re-trigger
    // the effect. The `eagerLoadedRef` guard must keep it at a single attempt;
    // without it, the count climbs unboundedly here.
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockFetchByType).toHaveBeenCalledTimes(1);
  });

  it('loads the default type once on success', async () => {
    mockFetchByType.mockResolvedValue({
      data: { lookup: { callout: { id: 'callout-1', framing: { id: 'framing-1', contributors: [] } } } },
    });

    const { result } = renderHook(() => useCrdSpaceContributors('callout-1'));

    await waitFor(() => expect(result.current.getCards('user')).toEqual([]));
    expect(mockFetchByType).toHaveBeenCalledTimes(1);
  });
});
