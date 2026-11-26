import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import type { ExplorerSpaceTreeQuery, NativeSubspaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { foundationTestData, memberFoundationTestData } from '@/core/foundation/foundationTestData';
import { NativeFoundationContext } from '@/core/foundation/NativeFoundationProvider';
import useSpaceExplorer from './useSpaceExplorer';

type TreeSpace = NativeSubspaceCardFragment & { depth: number; parent?: { __typename: 'Space'; id: string } | null };
const space = (id: string, depth: number, parent?: string, status: TreeSpace['status'] = 'ACTIVE'): TreeSpace => ({
  __typename: 'Space',
  id,
  url: `/spaces/${id}`,
  status,
  isContentPublic: depth === 0,
  pinned: false,
  tags: [`tag-${id}`],
  about: {
    __typename: 'About',
    displayName: `Name ${id}`,
    tagline: 'Tagline',
    avatar: { __typename: 'FileRef', file: { __typename: 'File', url: `/api/files/avatar-${id}` } },
    card: { __typename: 'FileRef', file: { __typename: 'File', url: `/api/files/card-${id}` } },
  },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [
    {
      __typename: 'User',
      id: `lead-${id}`,
      actorType: 'user',
      about: { __typename: 'About', displayName: `Lead ${id}`, avatar: null },
    },
  ],
  depth,
  parent: parent ? { __typename: 'Space', id: parent } : null,
});
const tree = (spaces: TreeSpace[], endCursor: string | null = null): ExplorerSpaceTreeQuery => ({
  subtree: {
    __typename: 'NodeConnection',
    edges: spaces.map(node => ({ __typename: 'NodeEdge', node })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: !!endCursor, endCursor },
  },
});

function setup(pages: ExplorerSpaceTreeQuery[], member = true) {
  const requests: { name: string; variables: Record<string, unknown> }[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({ name: operation.operationName, variables: operation.variables });
          const data =
            operation.operationName === 'NativeConfiguration' ? { config: foundationTestData().config } : pages.shift();
          if (data) observer.next({ data });
          else observer.error(new Error(`Unexpected request ${operation.operationName}`));
          observer.complete();
        })
    ),
  });
  const foundation = member ? memberFoundationTestData() : foundationTestData();
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <NativeFoundationContext
        value={{ data: foundation, loading: false, error: undefined, refetch: async () => ({}) as never }}
      >
        {children}
      </NativeFoundationContext>
    </ApolloProvider>
  );
  return { ...renderHook(useSpaceExplorer, { wrapper }), requests };
}

describe('the explorer as one subtree read under the platform', () => {
  it('lists each ACTIVE root with its full legacy card followed by its subspaces, in one request', async () => {
    const { result, requests } = setup([
      tree([
        space('one', 0),
        space('one-a', 1, 'one'),
        space('archived', 0, undefined, 'ARCHIVED'),
        space('archived-a', 1, 'archived'),
        space('two', 0),
        space('two-a', 1, 'two'),
      ]),
    ]);
    await waitFor(() => expect(result.current.spaces).toHaveLength(4));
    expect(requests.filter(request => request.name === 'ExplorerSpaceTree')).toEqual([
      { name: 'ExplorerSpaceTree', variables: { platform: foundationTestData().config.platformId } },
    ]);
    expect(result.current.spaces.map(card => [card.id, card.parent?.name])).toEqual([
      ['one', undefined],
      ['one-a', 'Name one'],
      ['two', undefined],
      ['two-a', 'Name two'],
    ]);
    const [root, child] = result.current.spaces;
    expect(root).toMatchObject({
      name: 'Name one',
      href: '/spaces/one',
      bannerImageUrl: '/api/files/card-one',
      avatarUrl: undefined,
      hideAvatar: true,
      isPrivate: false,
      isLocked: undefined,
      tags: ['tag-one'],
      leads: [{ name: 'Lead one', avatarUrl: '', type: 'person' }],
      visibility: 'active',
    });
    expect(child).toMatchObject({ avatarUrl: '/api/files/avatar-one-a', hideAvatar: false, isPrivate: true });
    expect(result.current.hasMore).toBe(false);
  });

  it('continues with 500 more on the next cursor, keeping subspaces under their root across pages', async () => {
    const { result, requests } = setup([
      tree([space('one', 0)], 'next/cursor=='),
      tree([space('one-a', 1, 'one'), space('two', 0)]),
    ]);
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(() => result.current.fetchMore());
    await waitFor(() => expect(result.current.spaces.map(card => card.id)).toEqual(['one', 'one-a', 'two']));
    expect(requests.filter(request => request.name === 'ExplorerSpaceTree').map(request => request.variables)).toEqual([
      { platform: foundationTestData().config.platformId },
      { platform: foundationTestData().config.platformId, after: 'next/cursor==' },
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it('shows no leads to an anonymous visitor, as legacy', async () => {
    const { result } = setup([tree([space('one', 0)])], false);
    await waitFor(() => expect(result.current.spaces).toHaveLength(1));
    expect(result.current.spaces[0].leads).toEqual([]);
  });

  it('lists nothing when the server answers no readable platform', async () => {
    const { result } = setup([{ subtree: null }], false);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.spaces).toEqual([]);
    expect(result.current.hasMore).toBeUndefined();
  });
});
