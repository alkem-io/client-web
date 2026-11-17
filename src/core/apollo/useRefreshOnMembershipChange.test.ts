/**
 * @vitest-environment jsdom
 */
import { ApolloClient, ApolloLink, ApolloProvider, gql, InMemoryCache, Observable, useQuery } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { typePolicies } from './config/typePolicies';
import { useRefreshOnMembershipChange } from './useRefreshOnMembershipChange';

const harness = vi.hoisted(() => ({ isAuthenticated: true }));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ isAuthenticated: harness.isAuthenticated }),
}));

// Stands in for any query on screen, e.g. one carrying comment privileges.
const ProbeDocument = gql`
  query ActiveProbe {
    platform {
      id
    }
  }
`;

let visibility: DocumentVisibilityState = 'hidden';

const fireVisibilityChange = (state: DocumentVisibilityState) => {
  visibility = state;
  act(() => void document.dispatchEvent(new Event('visibilitychange')));
};

const setup = () => {
  const server = { membershipIds: ['membership-1'], invitations: 0 };
  const operations: string[] = [];
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        operations.push(operation.operationName);
        const data =
          operation.operationName === 'LatestContributionsSpacesFlat'
            ? {
                me: {
                  __typename: 'MeQueryResults',
                  spaceMembershipsFlat: server.membershipIds.map(id => ({
                    __typename: 'CommunityMembershipResult',
                    id,
                    space: null,
                  })),
                },
              }
            : operation.operationName === 'PendingInvitationsCount'
              ? {
                  me: {
                    __typename: 'MeQueryResults',
                    communityInvitationsCount: server.invitations,
                    organizationInvitationsCount: 0,
                  },
                }
              : { platform: { __typename: 'Platform', id: 'platform-1' } };
        observer.next({ data });
        observer.complete();
      })
  );
  const client = new ApolloClient({ link, cache: new InMemoryCache({ typePolicies }) });
  const wrapper = ({ children }: { children: ReactNode }) => createElement(ApolloProvider, { client, children });
  const { result } = renderHook(
    () => {
      useRefreshOnMembershipChange();
      return useQuery(ProbeDocument);
    },
    { wrapper }
  );
  const fetches = (name: string) => operations.filter(operation => operation === name).length;
  return { server, client, result, fetches };
};

beforeEach(() => {
  harness.isAuthenticated = true;
  visibility = 'hidden';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useRefreshOnMembershipChange', () => {
  it('refetches what is on screen when a membership was added while away', async () => {
    const { server, result, fetches } = setup();
    await waitFor(() => expect(fetches('LatestContributionsSpacesFlat')).toBe(1));
    await waitFor(() => expect(result.current.data).toBeDefined());

    server.membershipIds = ['membership-1', 'membership-2'];
    fireVisibilityChange('visible');

    await waitFor(() => expect(fetches('ActiveProbe')).toBe(2));
    expect(result.current.data).toBeDefined();
  });

  it('notices a second membership change after its own refresh dropped the cache', async () => {
    const { server, result, fetches } = setup();
    await waitFor(() => expect(fetches('LatestContributionsSpacesFlat')).toBe(1));
    await waitFor(() => expect(result.current.data).toBeDefined());
    vi.useFakeTimers({ toFake: ['Date'] });

    server.membershipIds = ['membership-1', 'membership-2'];
    fireVisibilityChange('visible');
    await waitFor(() => expect(fetches('ActiveProbe')).toBe(2));

    fireVisibilityChange('hidden');
    vi.advanceTimersByTime(5_000);
    server.membershipIds = ['membership-1', 'membership-2', 'membership-3'];
    fireVisibilityChange('visible');

    await waitFor(() => expect(fetches('ActiveProbe')).toBe(3));
  });

  it('notices a membership change after an accept dropped the cache', async () => {
    const { server, client, result, fetches } = setup();
    await waitFor(() => expect(fetches('LatestContributionsSpacesFlat')).toBe(1));
    await waitFor(() => expect(result.current.data).toBeDefined());

    // What accepting an invitation does (useInvitationActions).
    await act(() =>
      client.refetchQueries({
        updateCache: cache => {
          cache.evict({ id: 'ROOT_QUERY' });
        },
      })
    );
    await waitFor(() => expect(fetches('ActiveProbe')).toBe(2));

    server.membershipIds = ['membership-1', 'membership-2'];
    fireVisibilityChange('visible');

    await waitFor(() => expect(fetches('ActiveProbe')).toBe(3));
  });

  it('refetches what is on screen when an invitation arrived while away', async () => {
    const { server, result, fetches } = setup();
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(1));
    await waitFor(() => expect(result.current.data).toBeDefined());

    server.invitations = 1;
    fireVisibilityChange('visible');

    await waitFor(() => expect(fetches('ActiveProbe')).toBe(2));
  });

  it('checks but leaves the screen alone when nothing changed', async () => {
    const { result, fetches } = setup();
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(1));
    await waitFor(() => expect(result.current.data).toBeDefined());

    fireVisibilityChange('visible');

    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(2));
    await waitFor(() => expect(fetches('LatestContributionsSpacesFlat')).toBe(2));
    expect(fetches('ActiveProbe')).toBe(1);
  });

  it('checks at most once per 5 s', async () => {
    const { fetches } = setup();
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(1));
    vi.useFakeTimers({ toFake: ['Date'] });

    fireVisibilityChange('visible');
    fireVisibilityChange('hidden');
    vi.advanceTimersByTime(4_000);
    fireVisibilityChange('visible');
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(2));

    fireVisibilityChange('hidden');
    vi.advanceTimersByTime(1_000);
    fireVisibilityChange('visible');
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(3));
  });

  it('does nothing while the page is hidden', async () => {
    const { fetches } = setup();
    await waitFor(() => expect(fetches('PendingInvitationsCount')).toBe(1));

    fireVisibilityChange('hidden');
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(fetches('PendingInvitationsCount')).toBe(1);
  });

  it('does nothing for anonymous users', async () => {
    harness.isAuthenticated = false;
    const { fetches } = setup();

    fireVisibilityChange('visible');
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(fetches('PendingInvitationsCount')).toBe(0);
    expect(fetches('LatestContributionsSpacesFlat')).toBe(0);
  });
});
