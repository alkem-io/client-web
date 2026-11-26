import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { SubspacesDialogConnector } from './SubspacesDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
// The list's scroll sentinel stands in as "more rows are needed": it asks for the next page while one exists.
vi.mock('@/crd/components/space/SpaceSubspacesList', () => ({
  SpaceSubspacesList: ({
    subspaces,
    hasMore,
    loading,
    onLoadMore,
  }: {
    subspaces: SpaceCardData[];
    hasMore: boolean;
    loading: boolean;
    onLoadMore: () => void;
  }) => {
    useEffect(() => {
      if (hasMore && !loading) onLoadMore();
    }, [hasMore, loading]);
    return <output aria-label="cards">{subspaces.map(card => card.name).join('|')}</output>;
  },
}));

// A child space's row of the space tree (NativeSubspaces: subtree, types [space]).
const child = (index: number) => ({
  __typename: 'Space',
  id: `child-${index}`,
  entityType: 'space',
  url: `/space/challenges/child-${index}`,
  status: 'ACTIVE',
  isContentPublic: true,
  pinned: false,
  tags: [],
  about: { __typename: 'About', displayName: `Child ${index}`, tagline: null, avatar: null, card: null },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [],
});
const connection = (from: number, to: number, hasNextPage: boolean, totalCount = 501) => ({
  __typename: 'NodeConnection',
  edges: Array.from({ length: to - from }, (_, offset) => ({
    __typename: 'NodeEdge',
    cursor: `c${from + offset + 1}`,
    node: child(from + offset + 1),
  })),
  pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: `c${to}` },
  totalCount,
});
const parent = { __typename: 'Space', id: 'space', entityType: 'space', settings: { sort_mode: 'alphabetical' } };

/** The server's NativeSubspaces pages: the first answers `first`, a continuation after c500 answers the rest. */
function setup(first: ReturnType<typeof connection>, open = true) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          if (operation.operationName !== 'NativeSubspaces') {
            observer.error(new Error(`unexpected ${operation.operationName}`));
            return;
          }
          const page = operation.variables.after === 'c500' ? connection(500, 501, false) : first;
          observer.next({ data: { node: parent, spaces: page } });
          observer.complete();
        })
    ),
  });
  render(
    <ApolloProvider client={client}>
      <SubspacesDialogConnector open={open} onOpenChange={vi.fn()} spaceId="space" emptyText="none" />
    </ApolloProvider>
  );
  return sent;
}

describe('SubspacesDialogConnector (021 T011)', () => {
  test('closed, the dialog sends nothing', async () => {
    const sent = setup(connection(0, 8, false, 8), false);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent).toEqual([]);
  });

  test("Show all sends one NativeSubspaces for the space's children and lists them", async () => {
    const sent = setup(connection(0, 8, false, 8));
    expect((await screen.findByLabelText('cards')).textContent?.split('|')).toHaveLength(8);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['NativeSubspaces', { root: 'space', first: 500 }],
    ]);
  });

  test('501 children: the first 500 then one D8 continuation after their cursor, all in server order', async () => {
    const sent = setup(connection(0, 500, true));
    await waitFor(() => expect(screen.getByLabelText('cards').textContent?.split('|')).toHaveLength(501));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['NativeSubspaces', { root: 'space', first: 500 }],
      ['NativeSubspaces', { root: 'space', first: 500, after: 'c500' }],
    ]);
    const names = screen.getByLabelText('cards').textContent?.split('|') ?? [];
    expect(names[0]).toBe('Child 1');
    expect(names[500]).toBe('Child 501');
  });
});
