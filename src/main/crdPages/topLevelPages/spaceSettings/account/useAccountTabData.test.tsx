import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { useAccountTabData } from './useAccountTabData';

const DAY = 24 * 60 * 60 * 1000;

const assignment = (
  id: string,
  name: string,
  scope: 'SPACE' | 'ACCOUNT',
  sortOrder: number,
  expiresAt: string | null
) => ({
  __typename: 'PlanAssignment',
  id,
  expiresAt,
  plan: { __typename: 'Plan', id: `plan-${id}`, name, scope, sortOrder },
});

function setup(planAssignments: ReturnType<typeof assignment>[]) {
  const requests: Array<{ variables: Record<string, unknown>; query: string }> = [];
  const reply = {
    node: {
      __typename: 'Space',
      id: 'space-1',
      entityType: 'space',
      url: 'https://alkem.io/space-1',
      status: 'ACTIVE',
      host: {
        __typename: 'Organization',
        id: 'org-1',
        actorType: 'organization',
        about: {
          __typename: 'About',
          displayName: 'Host Org',
          avatar: { __typename: 'FileRef', file: { __typename: 'File', url: '/avatar' } },
        },
      },
      planAssignments,
      can: { __typename: 'SpaceCan', delete: true },
    },
  };
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({ variables: operation.variables, query: print(operation.query) });
          const timer = setTimeout(() => {
            observer.next({ data: reply });
            observer.complete();
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>{children}</GlobalStateProvider>
    </ApolloProvider>
  );
  return { ...renderHook(() => useAccountTabData('space-1'), { wrapper }), requests };
}

describe('useAccountTabData — native Space read', () => {
  it('maps status, host and delete verdict from one space read', async () => {
    const fixture = setup([]);
    await waitFor(() => expect(fixture.result.current.url).toBe('https://alkem.io/space-1'));
    expect(fixture.requests).toHaveLength(1);
    expect(fixture.requests[0].variables).toEqual({ id: 'space-1' });
    expect(fixture.requests[0].query).not.toMatch(/lookup|licensingFramework|activeSubscription/);
    expect(fixture.result.current).toMatchObject({
      visibility: 'ACTIVE',
      host: { displayName: 'Host Org', avatarUrl: '/avatar', type: 'organization' },
      canDeleteSpace: true,
      plan: null,
    });
  });

  it('shows the unexpired SPACE plan with the highest sort order and its days left', async () => {
    const inTenDays = new Date(Date.now() + 10 * DAY - 1000).toISOString();
    const fixture = setup([
      assignment('a', 'Free', 'SPACE', 1, null),
      assignment('b', 'Premium', 'SPACE', 3, inTenDays),
      assignment('c', 'Lapsed', 'SPACE', 9, new Date(Date.now() - DAY).toISOString()),
      assignment('d', 'Account plan', 'ACCOUNT', 99, null),
    ]);
    await waitFor(() => expect(fixture.result.current.plan).not.toBeNull());
    expect(fixture.result.current.plan).toEqual({ name: 'Premium', features: [], daysLeft: 10 });
  });
});
