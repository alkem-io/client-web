import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceTreeDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import type { PostCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { nativePost, nativeResponse, nativeResponseRow, treeOf } from '../dataMappers/nativePostFixtures.test-utils';
import { useSpaceFeed } from './useCrdCalloutList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
    i18n: { language: 'en' },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock('@/domain/space/context/useSpace', () => ({ useSpace: () => ({ space: { levelZeroSpaceId: 'space-1' } }) }));
vi.mock('./useCrdCalloutMoveActions', () => ({ useCrdCalloutMoveActions: () => undefined }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const SPACE = 'space-1';
const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};

/**
 * The page's space tree, cached by its first read (`rows`: the space's posts and their response rows); its
 * continuation answers `more`. A space whose tree is not served gets no cache and the server's refusal.
 */
function setup(rows: PostCardFragment[], hasNextPage: boolean, more: PostCardFragment[] = [], space = SPACE) {
  const operations: string[] = [];
  const served = rows.length > 0;
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          operations.push(operation.operationName);
          if (operation.operationName !== 'SpaceTree') {
            observer.error(new Error(`unexpected ${operation.operationName}`));
          } else if (!served) {
            observer.next(NOT_SERVED);
          } else {
            expect(operation.variables).toEqual({
              ...spaceTreeVariables(space),
              after: `cursor-${rows[rows.length - 1].id}`,
            });
            observer.next({ data: { tree: treeOf(more) } });
          }
          observer.complete();
        })
    ),
  });
  if (served) {
    client.writeQuery({
      query: SpaceTreeDocument,
      variables: spaceTreeVariables(space),
      data: { tree: treeOf(rows, hasNextPage, hasNextPage ? `cursor-${rows[rows.length - 1].id}` : null) },
    });
  }
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  return { operations, wrapper };
}

const many = (count: number, prefix: string) => Array.from({ length: count }, (_, i) => nativePost(`${prefix}${i}`));

describe('useSpaceFeed (021 FR-007)', () => {
  test('a stage with 501 posts shows all 501 after one SpaceTree continuation, in server order', async () => {
    const posts = many(500, 'p').map((post, i) => ({ ...post, sortOrder: i }));
    const { operations, wrapper } = setup(posts, true, [nativePost('p500', { sortOrder: 500 })]);
    const { result } = renderHook(() => useSpaceFeed(SPACE, undefined), { wrapper });

    await waitFor(() => expect(result.current.posts).toHaveLength(501));
    expect(result.current.posts.map(post => post.id)).toEqual(Array.from({ length: 501 }, (_, i) => `p${i}`));
    expect(result.current.hasMore).toBe(false);
    expect(operations).toEqual(['SpaceTree']);
  });

  test("a stage's feed is the tree's own posts of that stage in their order, never its response rows", () => {
    const stage = (id: string) => ({ __typename: 'Stage' as const, id });
    const rows = [
      nativePost('b', { sortOrder: 2, stage: stage('stage-a') }),
      nativePost('other', { sortOrder: 1, stage: stage('stage-b') }),
      nativeResponseRow('a', 'r1', { stage: stage('stage-a') }),
      nativePost('a', { sortOrder: 0, stage: stage('stage-a') }),
    ];
    const { operations, wrapper } = setup(rows, false);
    const { result } = renderHook(() => useSpaceFeed(SPACE, 'stage-a'), { wrapper });
    expect(result.current.posts.map(post => post.id)).toEqual(['a', 'b']);
    expect(operations).toEqual([]);
  });

  test('a space tree the server does not serve yet: the feed is notServed, asked once, never re-sent', async () => {
    const { operations, wrapper } = setup([], false, [], 'space-feed-not-served');
    const { result, unmount } = renderHook(() => useSpaceFeed('space-feed-not-served', undefined), { wrapper });
    await waitFor(() => expect(result.current.notServed).toBe(true));
    expect(result.current).toMatchObject({ posts: [], loading: false, hasMore: false });
    unmount();
    const again = renderHook(() => useSpaceFeed('space-feed-not-served', undefined), { wrapper });
    expect(again.result.current.notServed).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(operations).toEqual(['SpaceTree']);
  });

  test('a feed without a next page sends nothing', () => {
    const { operations, wrapper } = setup(many(3, 'p'), false);
    const { result } = renderHook(() => useSpaceFeed(SPACE, undefined), { wrapper });
    expect(result.current.posts).toHaveLength(3);
    expect(operations).toEqual([]);
  }, 60_000);
});

const taskColumns = [
  { __typename: 'Stage' as const, id: 'todo', name: 'To do', sortOrder: 0 },
  { __typename: 'Stage' as const, id: 'done', name: 'Done', sortOrder: 1 },
];
// An editable board: its settings menu mounts the column manager, which reads the board from the cache.
const board = (id: string, taskCount: number) =>
  nativePost(id, {
    contentKind: 'task_board',
    can: { ...nativePost(id).can, update: true, manageColumns: true },
    responseKind: 'task',
    responseCount: taskCount,
    content: {
      __typename: 'TaskBoardContent',
      columns: taskColumns,
      tasks: Array.from({ length: taskCount }, (_, i) =>
        nativeResponse(`${id}-task${i}`, {
          contentKind: 'task',
          sortOrder: i,
          room: null,
          stage: { __typename: 'Stage', id: i % 2 === 0 ? 'todo' : 'done' },
        })
      ),
    },
  });

describe('the feed cards (021 FR-008, FR-009)', () => {
  test('every card renders from the space tree: a 4-response preview with "+N more" and whole boards, no request', async () => {
    const responses = Array.from({ length: 5 }, (_, i) =>
      nativeResponseRow('ordinary', `r${i}`, { sortOrder: i, room: null })
    );
    const ordinary = nativePost('ordinary', { responseKind: 'text', responseCount: 9 });
    const rows = [ordinary, ...responses, board('board-a', 6), board('board-b', 501)];
    const { operations, wrapper } = setup(rows, false);
    const { result } = renderHook(() => useSpaceFeed(SPACE, undefined), { wrapper });

    render(<CalloutListConnector callouts={result.current.posts} calloutsSetId={SPACE} />, { wrapper });

    expect(await screen.findByText('Post ordinary', {}, { timeout: 20_000 })).toBeInTheDocument();
    expect(screen.getByText('callout.moreContributions:6')).toBeInTheDocument();
    expect(screen.getAllByText(/^Response r\d$/).map(item => item.textContent)).toEqual([
      'Response r0',
      'Response r1',
      'Response r2',
    ]);
    expect(screen.getAllByText(/^Response board-a-task\d+$/)).toHaveLength(6);
    expect(screen.getAllByText(/^Response board-b-task\d+$/)).toHaveLength(501);
    expect(operations).toEqual([]);
  }, 60_000);
});
