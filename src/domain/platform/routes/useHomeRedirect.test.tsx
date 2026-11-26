import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import type { HomeRedirectMembershipsQuery, V2FoundationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { memberFoundationTestData } from '@/core/foundation/foundationTestData';
import { NativeFoundationContext } from '@/core/foundation/NativeFoundationProvider';
import { useHomeRedirect } from './useHomeRedirect';

const membership = (id: string, depth: number) => ({
  __typename: 'SpaceMembership' as const,
  space: { __typename: 'Space' as const, id, depth, url: `/${id}` },
});

function setup(memberships: ReturnType<typeof membership>[], autoRedirect: boolean, isAuthenticated = true) {
  const requests: string[] = [];
  const data: HomeRedirectMembershipsQuery = {
    viewer: { __typename: 'Viewer', id: 'viewer', actor: { __typename: 'User', id: 'viewer', memberships } },
  };
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push(operation.operationName);
          observer.next({ data });
          observer.complete();
        })
    ),
  });
  const member = memberFoundationTestData();
  const foundation: V2FoundationQuery = {
    ...member,
    viewer: {
      ...member.viewer,
      actor: member.viewer.actor && {
        ...member.viewer.actor,
        settings: { home_space: { id: '00000000-0000-0000-0000-000000000052', auto_redirect: autoRedirect } },
      },
    },
  };
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <NativeFoundationContext
        value={{ data: foundation, loading: false, error: undefined, refetch: async () => ({}) as never }}
      >
        {children}
      </NativeFoundationContext>
    </ApolloProvider>
  );
  return { ...renderHook(() => useHomeRedirect(isAuthenticated), { wrapper }), requests };
}

describe('the / home redirect (legacy useHomeRedirect.ts)', () => {
  it('sends a member of exactly one top-level space there, ignoring subspace memberships (me.service.spec.ts:380-421)', async () => {
    const view = setup([membership('child', 1), membership('only', 0), membership('grandchild', 2)], false);
    await waitFor(() => expect(view.result.current.redirectUrl).toBe('/only'));
    expect(view.requests).toEqual(['HomeRedirectMemberships']);
  });

  it('sends a member of several top-level spaces with auto-redirect to the home space', async () => {
    const view = setup([membership('a', 0), membership('a-child', 1), membership('b', 0)], true);
    await waitFor(() => expect(view.result.current.redirectUrl).toBe('/own-space'));
  });

  it('keeps a member of several top-level spaces without auto-redirect on /home', async () => {
    const view = setup([membership('a', 0), membership('b', 0)], false);
    await waitFor(() => expect(view.result.current.loading).toBe(false));
    expect(view.result.current.redirectUrl).toBeNull();
  });

  it('keeps a user without memberships on /home', async () => {
    const view = setup([], true);
    await waitFor(() => expect(view.result.current.loading).toBe(false));
    expect(view.result.current.redirectUrl).toBeNull();
  });

  it('asks nothing for an anonymous visitor', () => {
    const view = setup([membership('only', 0)], true, false);
    expect(view.result.current.redirectUrl).toBeNull();
    expect(view.requests).toEqual([]);
  });
});
