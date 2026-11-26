import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PostCardFragmentDoc, SpaceTreeDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import type { PostCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { mapPostToCallout } from '../dataMappers/calloutDataMapper';
import { nativePost, nativeResponse, nativeResponseRow, treeOf } from '../dataMappers/nativePostFixtures.test-utils';
import { CalloutDetailDialogConnector } from './CalloutDetailDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
    i18n: { language: 'en' },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
// Write controls owned by another task, with legacy reads of their own: not part of the dialog's read path here.
vi.mock('./CalloutSettingsConnector', () => ({ CalloutSettingsConnector: () => null }));
vi.mock('./CalloutShareDialog', () => ({ CalloutShareDialog: () => null }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};
const responseRows = (parent: string, count: number) =>
  Array.from({ length: count }, (_, i) => nativeResponseRow(parent, `r${i}`, { room: null, sortOrder: count - i }));

/**
 * The feed's card already holds the post (D2 PostCard); the page's space tree holds its response rows (depth 2), or
 * the server does not serve the tree read yet (`responses` undefined).
 */
function setup(post: PostCardFragment, responses?: PostCardFragment[], space = 'space-1') {
  const operations: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          operations.push(operation.operationName);
          if (operation.operationName === 'SpaceTree' && !responses) observer.next(NOT_SERVED);
          else observer.error(new Error(`unexpected ${operation.operationName}`));
          observer.complete();
        })
    ),
  });
  client.writeFragment({ fragment: PostCardFragmentDoc, fragmentName: 'PostCard', id: `Post:${post.id}`, data: post });
  if (responses) {
    client.writeQuery({
      query: SpaceTreeDocument,
      variables: spaceTreeVariables(space),
      data: { tree: treeOf([post, ...responses]) },
    });
  }
  const view = (open: boolean) => (
    <ApolloProvider client={client}>
      <CalloutDetailDialogConnector open={open} onOpenChange={vi.fn()} callout={mapPostToCallout(post, [], space)} />
    </ApolloProvider>
  );
  return { operations, view };
}

describe('CalloutDetailDialogConnector response window (021 FR-009, D4)', () => {
  test("opening lists the post's responses from the cached space tree in their order; nothing is sent", async () => {
    const post = nativePost('p1', { responseKind: 'text', responseCount: 5 });
    const { operations, view } = setup(post, responseRows('p1', 5));
    const { rerender } = render(view(false));
    expect(operations).toEqual([]);

    rerender(view(true));
    await waitFor(() => expect(screen.getAllByText(/^Response r\d+$/)).toHaveLength(5));
    expect(screen.getAllByText(/^Response r\d+$/).map(item => item.textContent)).toEqual(
      ['r4', 'r3', 'r2', 'r1', 'r0'].map(id => `Response ${id}`)
    );

    rerender(view(false));
    rerender(view(true));
    await waitFor(() => expect(screen.getAllByText(/^Response r\d+$/)).toHaveLength(5));
    expect(operations).toEqual([]);
  });

  test("a task board's dialog sends nothing: its tasks are the board's typed content", async () => {
    const board = nativePost('board', {
      contentKind: 'task_board',
      responseKind: 'task',
      responseCount: 2,
      content: {
        __typename: 'TaskBoardContent',
        columns: [{ __typename: 'Stage', id: 'todo', name: 'To do', sortOrder: 0 }],
        tasks: [0, 1].map(i => nativeResponse(`r${i}`, { contentKind: 'task', room: null, sortOrder: i })),
      },
    });
    const { operations, view } = setup(board, []);
    render(view(true));
    await waitFor(() => expect(screen.getAllByText(/^Response r\d+$/)).toHaveLength(2));
    expect(operations).toEqual([]);
  });

  test('a space tree the server does not serve yet: the responses say so once, with no retry', async () => {
    const post = nativePost('p1', { responseKind: 'text', responseCount: 5 });
    const { operations, view } = setup(post, undefined, 'space-window-not-served');
    const { rerender } = render(view(true));
    await waitFor(() => expect(screen.getAllByText('tabs.unavailable')).toHaveLength(1));
    expect(screen.queryByText(/^Response r\d+$/)).not.toBeInTheDocument();

    rerender(view(false));
    rerender(view(true));
    await waitFor(() => expect(screen.getAllByText('tabs.unavailable')).toHaveLength(1));
    expect(operations).toEqual(['SpaceTree']);
  });
});
