import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, test } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { nativePost, treeOf } from '@/main/crdPages/space/dataMappers/nativePostFixtures.test-utils';
import {
  type SpacePageNeed,
  spaceTreeVariables,
  treePosts,
  usePostResponses,
  useSpacePageData,
  useSpacePageLoad,
  useSpaceTree,
  useSpaceVirtualContributors,
} from './useSpacePage';

const space = (withSpace: boolean) => ({
  __typename: 'Space',
  id: 'space',
  entityType: 'space',
  ...(withSpace && {
    handle: 'space',
    url: '/space',
    depth: 0,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    tags: [],
    isContentPublic: true,
    settings: null,
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
  }),
});
// The space tree: one post with one response (depth 2) and one child-space face row.
const treeRow = (id: string, parentPost: string | null, sortOrder: number) =>
  nativePost(id, { sortOrder, parentPost: parentPost ? { __typename: 'Post', id: parentPost } : null });
const tree = treeOf([treeRow('r1', 'p1', 0), treeRow('p1', null, 0)]);
const vc = (id: string) => ({
  __typename: 'Member',
  id: `m-${id}`,
  actor: {
    __typename: 'GenericActor',
    id,
    actorType: 'virtual_contributor',
    url: `/vc/${id}`,
    about: { __typename: 'About', displayName: id, avatar: null },
  },
});
const members = (ids: string[], hasNextPage: boolean) => ({
  __typename: 'MemberConnection',
  edges: ids.map(id => ({ __typename: 'MemberEdge', cursor: `c-${id}`, node: vc(id) })),
  pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: hasNextPage ? `c-${ids[ids.length - 1]}` : null },
});
// The server's refusal of a read it does not serve yet: its schema validation (no field path).
const SCHEMA = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};
const post = {
  __typename: 'Post',
  entityType: 'post',
  ...nativePost('p1'),
  space: { __typename: 'Space', id: 'space', url: '/space' },
};

/** The server: `served` names the reads it answers; every other read is refused as not served. */
function setup({ served = ['SpaceTree', 'SpaceVirtualContributors'] } = {}) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          const v = operation.variables;
          const name = operation.operationName;
          if (name === 'SpacePage') observer.next({ data: { ...(v.withSpace && { node: space(true) }) } });
          else if (name === 'SpacePageWithPost') {
            observer.next({ data: { ...(v.withSpace && { node: space(true) }), post: { ...post, parentPost: null } } });
          } else if (!served.includes(name)) observer.next(SCHEMA);
          else if (name === 'SpaceTree') {
            observer.next({ data: { tree: v.after ? treeOf([treeRow('p2', null, 1)]) : { ...tree, pageInfo: page } } });
          } else observer.next({ data: { members: v.after ? members(['vc2'], false) : members(['vc1'], true) } });
          observer.complete();
        })
    ),
  });
  // The first tree page has a next page unless a test reads a single-page tree.
  let page = { __typename: 'PageInfo', hasNextPage: false, endCursor: null as string | null };
  const wrapper = ({ children: content }: PropsWithChildren) => (
    <ApolloProvider client={client}>{content}</ApolloProvider>
  );
  return {
    sent,
    wrapper,
    continuedTree: () => {
      page = { __typename: 'PageInfo', hasNextPage: true, endCursor: 'cursor-p1' };
    },
  };
}

const names = (sent: Operation[]) => sent.map(operation => operation.operationName);

describe('useSpacePageLoad (021 FR-003/FR-005)', () => {
  test('a page action sends one SpacePage for the Space document, and nothing once it is cached', async () => {
    const { sent, wrapper } = setup();
    const { rerender } = renderHook(
      ({ needs }: { needs: SpacePageNeed[] }) => {
        useSpacePageLoad('space', needs);
        return useSpacePageData('space', 'space');
      },
      { wrapper, initialProps: { needs: ['space'] } }
    );
    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpacePage', { space: 'space', withSpace: true }],
    ]);
    rerender({ needs: ['space'] });
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(sent).toHaveLength(1);
  });

  test('a cold post URL carries its post in the same request (SpacePageWithPost), and nothing once both are cached', async () => {
    const { sent, wrapper } = setup();
    const { result, rerender } = renderHook(
      () => {
        useSpacePageLoad('space', ['space'], 'p1');
        return useSpacePageData('space', 'space');
      },
      { wrapper }
    );
    await waitFor(() => expect(result.current?.node).toBeDefined());
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpacePageWithPost', { space: 'space', withSpace: true, post: 'p1' }],
    ]);
    rerender();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(sent).toHaveLength(1);
  });
});

describe('useSpaceTree (spaces 2026-11-26: the page reads its SPACE TREE)', () => {
  test('every tree section shares one SpaceTree; posts are depth 1, responses their depth-2 rows', async () => {
    const { sent, wrapper } = setup();
    const { result } = renderHook(
      () => ({ tree: useSpaceTree('space-tree'), responses: usePostResponses('space-tree', 'p1') }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.tree.tree).toBeDefined());
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpaceTree', spaceTreeVariables('space-tree')],
    ]);
    expect(treePosts(result.current.tree.tree).map(post => post.id)).toEqual(['p1']);
    expect(result.current.responses.responses?.map(response => response.id)).toEqual(['r1']);
    expect(result.current.responses.complete).toBe(true);
    expect(result.current.tree.notServed).toBe(false);
  });

  test('the tree continues itself once per cursor, whichever reader asks, and every reader sees the whole tree', async () => {
    const { sent, wrapper, continuedTree } = setup();
    continuedTree();
    const { result } = renderHook(
      () => ({ feed: useSpaceTree('space-continued'), index: useSpaceTree('space-continued') }),
      { wrapper }
    );
    await waitFor(() => expect(treePosts(result.current.index.tree).map(post => post.id)).toEqual(['p1', 'p2']));
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpaceTree', spaceTreeVariables('space-continued')],
      ['SpaceTree', { ...spaceTreeVariables('space-continued'), after: 'cursor-p1' }],
    ]);
  });

  test('a tree the server does not serve yet is notServed, asked once and never re-sent', async () => {
    const { sent, wrapper } = setup({ served: [] });
    const { result, unmount } = renderHook(() => usePostResponses('space-not-served', 'p1'), { wrapper });
    await waitFor(() => expect(result.current.notServed).toBe(true));
    expect(result.current.responses).toBeUndefined();
    unmount();

    const again = renderHook(() => useSpaceTree('space-not-served'), { wrapper });
    expect(again.result.current.notServed).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(names(sent)).toEqual(['SpaceTree']);
  });
});

describe("useSpaceVirtualContributors (the widget's members read)", () => {
  test('the virtual contributors continue themselves', async () => {
    const { sent, wrapper } = setup();
    const { result } = renderHook(() => useSpaceVirtualContributors('space-vcs'), { wrapper });
    await waitFor(() => expect(result.current.members?.edges.map(edge => edge.node.actor.id)).toEqual(['vc1', 'vc2']));
    expect(result.current.notServed).toBe(false);
    expect(sent.map(operation => [operation.operationName, operation.variables.after])).toEqual([
      ['SpaceVirtualContributors', undefined],
      ['SpaceVirtualContributors', 'c-vc1'],
    ]);
  });

  test('a members read the server does not serve yet is notServed, asked once and never re-sent', async () => {
    const { sent, wrapper } = setup({ served: [] });
    const hook = () => useSpaceVirtualContributors('vcs-not-served');
    const { result, unmount } = renderHook(hook, { wrapper });
    await waitFor(() => expect(result.current.notServed).toBe(true));
    unmount();
    const again = renderHook(hook, { wrapper });
    expect(again.result.current.notServed).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(names(sent)).toEqual(['SpaceVirtualContributors']);
  });
});
