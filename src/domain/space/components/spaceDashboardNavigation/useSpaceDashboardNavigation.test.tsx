import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { SpacePageDocument, SpaceTreeDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { SubspacesSection } from '@/crd/components/space/sidebar/SubspacesSection';
import { spacePageVariables, spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { nativePost } from '@/main/crdPages/space/dataMappers/nativePostFixtures.test-utils';
import useSpaceDashboardNavigation from './useSpaceDashboardNavigation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// A child space's face row in the space tree (NativeSubspaceCard).
const card = (index: number, pinned = index === 1) => ({
  __typename: 'Space',
  id: `child-${index}`,
  entityType: 'space',
  url: `/space/challenges/child-${index}`,
  pinned,
  isContentPublic: index !== 2,
  status: 'ACTIVE',
  tags: [],
  about: { __typename: 'About', displayName: `Child ${index}`, tagline: null, avatar: null, card: null },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [],
});
const treeEdges = (nodes: object[]) =>
  nodes.map((node, index) => ({ __typename: 'NodeEdge', cursor: `c${index}`, node }));
const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};
const space = (sortMode: string) => ({
  __typename: 'Space',
  id: 'space',
  entityType: 'space',
  handle: 'space',
  url: '/space',
  depth: 0,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: [],
  isContentPublic: true,
  settings: { sort_mode: sortMode },
  videoCallUrl: null,
  memberCount: null,
  about: {
    __typename: 'About',
    displayName: 'Space',
    tagline: null,
    description: null,
    location: null,
    facets: [],
    avatar: null,
    banner: null,
    card: null,
  },
  links: [],
  classifications: [],
  guidelines: null,
  applicationForm: null,
  host: null,
  leads: [],
  stages: [],
  membership: null,
  parent: null,
  entitlements: [],
  can: {
    __typename: 'SpaceCan',
    ...Object.fromEntries(
      [
        'read',
        'update',
        'delete',
        'archive',
        'createPost',
        'createSubspace',
        'createDocument',
        'invite',
        'manageMembers',
        'manageTemplates',
        'upload',
        'readActivity',
        'saveAsTemplate',
        'join',
        'apply',
      ].map(flag => [flag, false])
    ),
  },
});

/** The Space document cached by the page, and the space tree: served with `count` child spaces among posts, or refused. */
function setup(sortMode: string, count: number | 'not served', spaceId = 'space') {
  const sent: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation.operationName);
          if (operation.operationName === 'SpaceTree' && count === 'not served') {
            observer.next(NOT_SERVED);
            observer.complete();
          } else observer.error(new Error('unexpected'));
        })
    ),
  });
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables(spaceId, ['space']),
    data: { node: { ...space(sortMode), id: spaceId } },
  });
  if (count !== 'not served') {
    // The tree lists the space's posts beside its child spaces; only the child spaces are links.
    const children = Array.from({ length: count }, (_, index) => card(index + 1));
    client.writeQuery({
      query: SpaceTreeDocument,
      variables: spaceTreeVariables(spaceId),
      data: {
        tree: {
          __typename: 'NodeConnection',
          edges: treeEdges([{ ...nativePost('post-1'), entityType: 'post' }, ...children]),
          pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: `c${count}` },
          totalCount: count + 1,
        },
      },
    });
  }
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const { result } = renderHook(() => useSpaceDashboardNavigation({ spaceId }), { wrapper });
  return { sent, result };
}

const renderSection = (children: { displayName: string; url: string }[] = [], unavailableMessage?: string) =>
  render(
    <SubspacesSection
      subspaces={children.map(child => ({ name: child.displayName, initials: 'C', href: child.url }))}
      onShowAllClick={vi.fn()}
      unavailableMessage={unavailableMessage}
    />
  );

describe('useSpaceDashboardNavigation (021 T011, F040)', () => {
  test('the 7-view: six rows and Show all, the lock and the pin of an alphabetical parent, no request', () => {
    const { sent, result } = setup('alphabetical', 12);
    const children = result.current.dashboardNavigation?.children ?? [];
    expect(children.map(child => child.id)).toEqual([1, 2, 3, 4, 5, 6, 7].map(index => `child-${index}`));
    expect(children[0].pinned).toBe(true);
    expect(children[1].private).toBe(true);
    renderSection(children);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'sidebar.showAll' })).toBeInTheDocument();
    expect(sent).toEqual([]);
  });

  test('a custom-order parent shows no pin', () => {
    const { result } = setup('custom', 3);
    expect(result.current.dashboardNavigation?.children.map(child => child.pinned)).toEqual([false, false, false]);
  });

  test("the cached space tree serves its first 7 child spaces in the tree's order", () => {
    const { sent, result } = setup('alphabetical', 500);
    expect(result.current.dashboardNavigation?.children.map(child => child.displayName)).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map(index => `Child ${index}`)
    );
    expect(result.current.loading).toBe(false);
    expect(sent).toEqual([]);
  });

  test('skipped (no subspaceLinks widget): nothing read, not loading', () => {
    const { result } = renderHook(() => useSpaceDashboardNavigation({ spaceId: 'space', skip: true }), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ApolloProvider client={new ApolloClient({ cache: createV2Cache(), link: ApolloLink.empty() })}>
          {children}
        </ApolloProvider>
      ),
    });
    expect(result.current).toEqual({ dashboardNavigation: undefined, loading: false, unavailable: false });
  });

  test('a space tree the server does not serve yet: the links widget says so, asked once', async () => {
    const { sent, result } = setup('alphabetical', 'not served', 'space-tree-not-served');
    await waitFor(() => expect(result.current.unavailable).toBe(true));
    expect(result.current).toMatchObject({ dashboardNavigation: undefined, loading: false });
    renderSection([], 'tabs.unavailable');
    expect(screen.getByText('tabs.unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(sent).toEqual(['SpaceTree']);
  });
});
