import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError, print } from 'graphql';
import { Component, type PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NativeSubspaceCardFragment, NativeSubspacesQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { nativeSubspaceCard } from '@/main/crdPages/space/dataMappers/subspaceCardDataMapper';
import { useNativeSubspaces } from './useNativeSubspaces';

const child = (id: string): NativeSubspaceCardFragment => ({
  __typename: 'Space',
  id,
  url: `/spaces/${id}`,
  status: 'ACTIVE',
  isContentPublic: false,
  pinned: true,
  tags: ['shared'],
  about: {
    __typename: 'About',
    displayName: id,
    tagline: 'Tagline',
    avatar: { __typename: 'FileRef', file: { __typename: 'File', url: '/avatar' } },
    card: { __typename: 'FileRef', file: { __typename: 'File', url: '/card' } },
  },
  membership: { __typename: 'Membership', roles: ['member'] },
  can: { __typename: 'SpaceCan', read: true },
  leads: [
    {
      __typename: 'Organization',
      id: 'lead',
      actorType: 'organization',
      about: { __typename: 'About', displayName: 'Lead', avatar: null },
    },
  ],
});
const page = (
  root: string,
  children: NativeSubspaceCardFragment[],
  after: string | null = null
): NativeSubspacesQuery => ({
  node: {
    __typename: 'Space',
    id: root,
    entityType: 'space',
    settings: { sort_mode: 'alphabetical' },
  },
  // The space tree's rows of type space (subtree, types [space]).
  spaces: {
    __typename: 'NodeConnection',
    edges: children.map((node, index) => ({
      __typename: 'NodeEdge',
      cursor: index === children.length - 1 && after ? after : `opaque-${node.id}`,
      node: { ...node, entityType: 'space' },
    })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: after !== null, endCursor: after },
    totalCount: null,
  },
});

function setup(replies: Array<NativeSubspacesQuery | Error | { errors: GraphQLError[] }>, initialRoot = 'parent') {
  const requests: Array<{ variables: Record<string, unknown>; query: string }> = [];
  const failures: Error[] = [];
  class Boundary extends Component<PropsWithChildren, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
      return { failed: true };
    }
    componentDidCatch(error: Error) {
      failures.push(error);
    }
    render() {
      return this.state.failed ? null : this.props.children;
    }
  }
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({ variables: operation.variables, query: print(operation.query) });
          const reply = replies.shift();
          const timer = setTimeout(() => {
            if (reply instanceof Error) observer.error(reply);
            else if (reply && 'errors' in reply) {
              observer.next(reply);
              observer.complete();
            } else if (reply) {
              observer.next({ data: reply });
              observer.complete();
            } else observer.error(new Error('Unexpected child request'));
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <Boundary>{children}</Boundary>
    </ApolloProvider>
  );
  const hook = renderHook(({ root }) => useNativeSubspaces(root), { initialProps: { root: initialRoot }, wrapper });
  return { ...hook, requests, failures, client, wrapper };
}

afterEach(() => vi.restoreAllMocks());

describe('native direct children', () => {
  it('loads 305 children in one first500 document and preserves the signed server order', async () => {
    const children = Array.from({ length: 305 }, (_, index) => child(`child-${304 - index}`));
    const fixture = setup([page('parent', children)]);
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(305));
    expect(fixture.requests).toHaveLength(1);
    expect(fixture.requests[0].variables).toEqual({ root: 'parent', first: 500 });
    expect(fixture.requests[0].query).toMatch(/subtree\(\s*root: \$root\s+maxDepth: 1\s+types: \["space"\]/);
    expect(fixture.requests[0].query).toContain('totalCount');
    expect(fixture.requests[0].query).not.toMatch(/lookup|\bsubspaces\(/);
    expect(fixture.result.current.subspaces?.map(node => node.id)).toEqual(children.map(node => node.id));
    expect(fixture.result.current.totalCount).toBeNull();
    expect(nativeSubspaceCard(children[0], fixture.result.current.showPins)).toMatchObject({
      name: 'child-304',
      href: '/spaces/child-304',
      avatarUrl: '/avatar',
      bannerImageUrl: '/card',
      description: 'Tagline',
      isPrivate: true,
      isMember: true,
      isPinned: true,
      leads: [{ name: 'Lead', type: 'org' }],
    });
  });

  it('uses opaque continuation once and keeps different parents and depths separate', async () => {
    const cursor = 'opaque/+cursor==';
    const fixture = setup([
      page('parent', [child('first')], cursor),
      page('parent', [child('second')]),
      page('second', [child('third')]),
      page('third', [child('fourth')]),
    ]);
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(1));
    await act(async () => {
      await Promise.all([fixture.result.current.loadMore(), fixture.result.current.loadMore()]);
    });
    await waitFor(() => expect(fixture.result.current.subspaces?.map(node => node.id)).toEqual(['first', 'second']));
    fixture.rerender({ root: 'second' });
    expect(fixture.result.current.subspaces).toBeUndefined();
    await waitFor(() => expect(fixture.result.current.subspaces?.[0].id).toBe('third'));
    fixture.rerender({ root: 'third' });
    await waitFor(() => expect(fixture.result.current.subspaces?.[0].id).toBe('fourth'));
    expect(fixture.requests.map(request => request.variables)).toEqual([
      { root: 'parent', first: 500 },
      { root: 'parent', first: 500, after: cursor },
      { root: 'second', first: 500 },
      { root: 'third', first: 500 },
    ]);
  });

  it('distinguishes disclosed empty children from an undisclosed anchor', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const empty = setup([page('parent', [])]);
    await waitFor(() => expect(empty.result.current.subspaces).toEqual([]));
    expect(empty.failures).toEqual([]);
    const absent = setup([{ ...page('parent', []), node: null }]);
    await waitFor(() => expect(absent.failures[0]?.message).toBe('Not Found'));
    expect(absent.requests).toHaveLength(1);
  });

  it('keeps refusal and unavailable reads visible without substituting empty success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const denied = setup([{ errors: [new GraphQLError('Authorization denied')] }]);
    await waitFor(() => expect(denied.failures[0]?.message).toBe('Authorization denied'));
    const unavailable = setup([new Error('Backend unavailable')]);
    await waitFor(() => expect(unavailable.failures[0]?.message).toBe('Backend unavailable'));
    expect(denied.requests).toHaveLength(1);
    expect(unavailable.requests).toHaveLength(1);
  });

  it('keeps disclosed visitor cards visible with their real locked state', async () => {
    const face = { ...child('face'), can: { __typename: 'SpaceCan' as const, read: false }, membership: { roles: [] } };
    const fixture = setup([page('parent', [face])]);
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(1));
    expect(fixture.result.current.subspaces?.map(node => nativeSubspaceCard(node, false))).toMatchObject([
      { id: 'face', href: '/spaces/face', isLocked: true, isMember: false },
    ]);
    expect(fixture.requests[0].query).not.toMatch(/privileges|createSubspace/);
    expect(fixture.failures).toEqual([]);
  });

  it('replaces old private children and READ capabilities on a genuine refresh', async () => {
    const visible = child('visible');
    const fixture = setup([
      page('parent', [child('private'), visible]),
      page('parent', [{ ...visible, can: { ...visible.can, read: false } }]),
    ]);
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(2));
    await act(() => fixture.result.current.refetch());
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(1));
    expect(
      fixture.result.current.subspaces?.map(node => ({ id: node.id, locked: nativeSubspaceCard(node, false).isLocked }))
    ).toEqual([{ id: 'visible', locked: true }]);
    expect(fixture.requests).toHaveLength(2);
  });

  it('surfaces failed continuations rather than silently truncating the list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = setup([page('parent', [child('one')], 'opaque'), new Error('Continuation unavailable')]);
    await waitFor(() => expect(fixture.result.current.subspaces).toHaveLength(1));
    await act(() => fixture.result.current.loadMore());
    await waitFor(() => expect(fixture.failures[0]?.message).toBe('Continuation unavailable'));
    expect(fixture.requests).toHaveLength(2);
  });
});
