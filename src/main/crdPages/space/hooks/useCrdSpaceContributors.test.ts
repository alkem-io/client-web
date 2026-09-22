import { act, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType, ContributorCollectionView } from '@/core/apollo/generated/graphql-schema';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockUseConfigQuery = vi.fn();
const mockFetchByType = vi.fn();
// Lets a test drive the shared lazy-query observable's ambient `data`/`variables`
// independently of `mockFetchByType`'s own promise resolution — the only way to
// reproduce the real Apollo race (ambient state pairing lagging/mismatching a
// concurrent call's own ".then()" result).
let emitAmbient: (state: { data: unknown; variables: unknown }) => void = () => {};

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useContributorCollectionConfigQuery: (opts: unknown) => mockUseConfigQuery(opts),
  // Apollo's useLazyQuery returns [execute, resultObject]; the hook reads the
  // result's `data`/`variables` to sync refetched cards, so provide both.
  useContributorCollectionByTypeLazyQuery: () => {
    const [state, setState] = useState<{ data: unknown; variables: unknown }>({
      data: undefined,
      variables: undefined,
    });
    emitAmbient = setState;
    return [mockFetchByType, state];
  },
}));

import { useCrdSpaceContributors } from './useCrdSpaceContributors';

const collectionData = (calloutId: string, items: unknown[]) => ({
  lookup: { callout: { id: calloutId, framing: { id: 'framing-1', contributors: items } } },
});

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

describe('useCrdSpaceContributors — concurrent per-type fetches (US2-AS2 regression)', () => {
  it('a stray ambient mirror of an in-flight sibling fetch does not clobber a just-written type', async () => {
    // Two selected types, default type (user) resolves to zero — the auto-heal
    // scenario: the consumer calls `ensureLoaded('organization')` while the
    // eager default-type ('user') fetch is still in flight.
    mockUseConfigQuery.mockReturnValue({
      data: {
        lookup: {
          callout: {
            id: 'callout-1',
            framing: {
              id: 'framing-1',
              contributorCounts: { users: 0, organizations: 2, virtualContributors: 0 },
            },
            settings: {
              framing: {
                contributors: {
                  contributorTypes: [ActorType.User, ActorType.Organization],
                  defaultContributorType: ActorType.User,
                  defaultView: ContributorCollectionView.List,
                },
              },
            },
          },
        },
      },
      loading: false,
    });

    let resolveUser: (value: unknown) => void = () => {};
    const userPromise = new Promise(resolve => {
      resolveUser = resolve;
    });
    let resolveOrg: (value: unknown) => void = () => {};
    const orgPromise = new Promise(resolve => {
      resolveOrg = resolve;
    });
    mockFetchByType.mockImplementation(({ variables }: { variables: { type: ActorType } }) =>
      variables.type === ActorType.Organization ? orgPromise : userPromise
    );

    const { result } = renderHook(() => useCrdSpaceContributors('callout-1'));

    // Eager default-type ('user') load fires on mount.
    await waitFor(() =>
      expect(mockFetchByType).toHaveBeenCalledWith({ variables: { calloutId: 'callout-1', type: ActorType.User } })
    );

    // The auto-heal fetch for 'organization' starts while 'user' is still pending.
    act(() => {
      result.current.ensureLoaded('organization');
    });
    await waitFor(() =>
      expect(mockFetchByType).toHaveBeenCalledWith({
        variables: { calloutId: 'callout-1', type: ActorType.Organization },
      })
    );

    // Organization's own request resolves with its real, non-empty data.
    resolveOrg({
      data: collectionData('callout-1', [
        { id: 'org-1', displayName: 'Org One', type: ActorType.Organization },
        { id: 'org-2', displayName: 'Org Two', type: ActorType.Organization },
      ]),
    });
    await waitFor(() => expect(result.current.getCards('organization')).toHaveLength(2));

    // A stray ambient update lands next, pairing the LAST-called variables
    // (organization — 'user' is still in flight, so its own fetch hasn't settled
    // to bump the ambient state back) with an EARLIER, empty response — exactly
    // the real Apollo race this hook must not trust while a sibling fetch is
    // still pending. It must not clobber the just-written organization entry.
    act(() => {
      emitAmbient({
        data: collectionData('callout-1', []),
        variables: { calloutId: 'callout-1', type: ActorType.Organization },
      });
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(result.current.getCards('organization')).toHaveLength(2);

    // Once 'user' also settles (no fetch left in flight), cardsByType holds both
    // correctly — nothing was lost either way.
    resolveUser({ data: collectionData('callout-1', []) });
    await waitFor(() => expect(result.current.getCards('user')).toEqual([]));
    expect(result.current.getCards('organization')).toHaveLength(2);
  });
});
