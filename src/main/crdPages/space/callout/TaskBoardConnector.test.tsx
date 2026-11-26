import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PostCardFragmentDoc } from '@/core/apollo/generated-v2/apollo-hooks';
import type { PostCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { TaskBoardColumnModel } from '@/crd/components/callout/task-board/TaskBoardView';
import { nativePost, nativeResponse } from '../dataMappers/nativePostFixtures.test-utils';
import { TaskBoardConnector } from './TaskBoardConnector';

const view = vi.hoisted(() => ({
  props: undefined as { columns: TaskBoardColumnModel[]; canMove: boolean } | undefined,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/crd/components/callout/task-board/TaskBoardView', () => ({
  TaskBoardView: (props: { columns: TaskBoardColumnModel[]; canMove: boolean }) => {
    view.props = props;
    return <div>board</div>;
  },
}));

const column = (id: string, name: string, sortOrder: number) => ({ __typename: 'Stage' as const, id, name, sortOrder });
const task = (id: string, stage: string, sortOrder: number) =>
  nativeResponse(id, { contentKind: 'task', sortOrder, stage: { __typename: 'Stage', id: stage } });

function renderBoard(post: PostCardFragment) {
  const operations: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(operation => {
      operations.push(operation.operationName);
      return Observable.of();
    }),
  });
  client.writeFragment({ fragment: PostCardFragmentDoc, fragmentName: 'PostCard', id: `Post:${post.id}`, data: post });
  render(
    <ApolloProvider client={client}>
      <TaskBoardConnector calloutId={post.id} fallback={<div>plain preview</div>} />
    </ApolloProvider>
  );
  return operations;
}

describe('TaskBoardConnector (021 FR-009, H19)', () => {
  test('renders every task by column, in column and task order, from the board content with no request', () => {
    const board = nativePost('board', {
      contentKind: 'task_board',
      can: { ...nativePost('x').can, moveTask: true },
      content: {
        __typename: 'TaskBoardContent',
        columns: [column('done', 'Done', 1), column('todo', 'To do', 0)],
        tasks: [task('t3', 'todo', 2), task('t1', 'todo', 0), task('t2', 'done', 1)],
      },
    });
    expect(renderBoard(board)).toEqual([]);
    expect(view.props?.canMove).toBe(true);
    expect(view.props?.columns.map(({ name, count, cards }) => [name, count, cards.map(card => card.id)])).toEqual([
      ['To do', 2, ['t1', 't3']],
      ['Done', 1, ['t2']],
    ]);
  });

  test('a post that is not a board renders the fallback', () => {
    expect(renderBoard(nativePost('plain'))).toEqual([]);
    expect(screen.getByText('plain preview')).toBeInTheDocument();
  });
});
