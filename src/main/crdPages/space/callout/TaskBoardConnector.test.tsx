import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';

const useTaskBoardDataQuery = vi.fn();
const moveTaskMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useTaskBoardDataQuery: (options: unknown) => useTaskBoardDataQuery(options),
  useMoveTaskToColumnMutation: () => [moveTaskMock, {}] as const,
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// Capture the props the connector feeds the view so the move glue can be
// exercised without driving a real @dnd-kit pointer sequence in jsdom.
let capturedViewProps: Record<string, unknown> | undefined;
vi.mock('@/crd/components/callout/task-board/TaskBoardView', () => ({
  TaskBoardView: (props: Record<string, unknown>) => {
    capturedViewProps = props;
    const columns = props.columns as { name: string; count: number; cards: { id: string; title: string }[] }[];
    return (
      <div>
        {columns.map(column => (
          <div key={column.name}>
            <span>{column.name}</span>
            <span>{column.count}</span>
            {column.cards.map(card => (
              <span key={card.id}>{card.title}</span>
            ))}
          </div>
        ))}
        {props.canMove ? <span data-testid="can-move" /> : null}
        {props.canAdd ? <span data-testid="can-add" /> : null}
      </div>
    );
  },
}));

// Capture the props the creation connector is opened with (calloutId + taskColumn).
let capturedAddProps: Record<string, unknown> | undefined;
vi.mock('./PostContributionAddConnector', () => ({
  PostContributionAddConnector: (props: Record<string, unknown>) => {
    capturedAddProps = props;
    return <div data-testid="add-dialog" data-column={String(props.taskColumn)} />;
  },
}));

import { TaskBoardConnector } from './TaskBoardConnector';

const FALLBACK = <div data-testid="plain-preview">plain preview</div>;

function boardCallout(overrides: Record<string, unknown> = {}) {
  return {
    id: 'callout-1',
    authorization: { id: 'a', myPrivileges: [AuthorizationPrivilege.Contribute] },
    settings: { contribution: { allowedTypes: [CalloutContributionType.Post] } },
    classification: {
      id: 'c',
      tagsets: [{ id: 't', name: 'task', allowedValues: ['Backlog', 'Done'] }],
    },
    taskColumnCounts: [
      { column: 'Backlog', count: 1 },
      { column: 'Done', count: 0 },
    ],
    contributions: [
      {
        id: 'contrib-1',
        sortOrder: 1,
        classification: { id: 'cc', tagsets: [{ id: 'ct', name: 'task', tags: ['Backlog'] }] },
        post: {
          id: 'post-1',
          createdBy: { id: 'u', profile: { id: 'p', displayName: 'Ada', avatar: undefined } },
          profile: { id: 'pp', displayName: 'First task', description: undefined, tagset: undefined },
          comments: { id: 'r', messagesCount: 0 },
        },
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  useTaskBoardDataQuery.mockReset();
  moveTaskMock.mockReset();
  capturedViewProps = undefined;
  capturedAddProps = undefined;
});

describe('TaskBoardConnector', () => {
  it('renders the board view for a marked POSTS callout', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.queryByTestId('plain-preview')).not.toBeInTheDocument();
  });

  it('uses the authoritative counts, not the card list length', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    // One card renders under Backlog, but the count comes from taskColumnCounts.
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('falls back to the plain preview when the marker tagset is absent', () => {
    useTaskBoardDataQuery.mockReturnValue({
      data: {
        lookup: {
          callout: boardCallout({
            classification: { id: 'c', tagsets: [{ id: 't', name: 'flow-state', allowedValues: [] }] },
          }),
        },
      },
    });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('plain-preview')).toBeInTheDocument();
  });

  it('falls back while the query is still loading', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: undefined });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('plain-preview')).toBeInTheDocument();
  });

  it('enables moving only with the MOVE_TASK privilege', () => {
    useTaskBoardDataQuery.mockReturnValue({
      data: {
        lookup: {
          callout: boardCallout({
            authorization: { id: 'a', myPrivileges: [AuthorizationPrivilege.Contribute] },
          }),
        },
      },
    });
    const { rerender } = render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.queryByTestId('can-move')).not.toBeInTheDocument();

    useTaskBoardDataQuery.mockReturnValue({
      data: {
        lookup: {
          callout: boardCallout({
            authorization: {
              id: 'a',
              myPrivileges: [AuthorizationPrivilege.Contribute, AuthorizationPrivilege.MoveTask],
            },
          }),
        },
      },
    });
    rerender(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('can-move')).toBeInTheDocument();
  });

  it('moves a task with the mutation, optimistic tag, and count patch on a cross-column drop', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);

    const onMoveTask = capturedViewProps?.onMoveTask as (id: string, column: string) => void;
    onMoveTask('contrib-1', 'Done');

    expect(moveTaskMock).toHaveBeenCalledTimes(1);
    const options = moveTaskMock.mock.calls[0][0];
    expect(options.variables).toEqual({ moveData: { contributionID: 'contrib-1', column: 'Done' } });
    // Optimistic tag reflects the destination column.
    expect(options.optimisticResponse.moveTaskToColumn.classification.tagsets[0].tags).toEqual(['Done']);

    // The cache update patches the authoritative counts: Backlog -1, Done +1.
    const modify = vi.fn();
    options.update({ identify: () => 'Callout:callout-1', modify });
    const patched = modify.mock.calls[0][0].fields.taskColumnCounts([
      { column: 'Backlog', count: 1 },
      { column: 'Done', count: 0 },
    ]);
    expect(patched).toEqual([
      { column: 'Backlog', count: 0 },
      { column: 'Done', count: 1 },
    ]);
  });

  it('shows an error toast when the move fails', async () => {
    const { toast } = await import('sonner');
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);

    const onMoveTask = capturedViewProps?.onMoveTask as (id: string, column: string) => void;
    onMoveTask('contrib-1', 'Done');
    const options = moveTaskMock.mock.calls[0][0];
    options.onError();
    expect(toast.error).toHaveBeenCalledWith('moveError');
  });

  it('exposes the add affordance only with the CONTRIBUTE privilege', () => {
    useTaskBoardDataQuery.mockReturnValue({
      data: { lookup: { callout: boardCallout({ authorization: { id: 'a', myPrivileges: [] } }) } },
    });
    const { rerender } = render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.queryByTestId('can-add')).not.toBeInTheDocument();

    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    rerender(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('can-add')).toBeInTheDocument();
  });

  it('opens the creation dialog pre-targeted at the picked column', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.queryByTestId('add-dialog')).not.toBeInTheDocument();

    const onAddTask = capturedViewProps?.onAddTask as (column: string) => void;
    act(() => onAddTask('Done'));

    const dialog = screen.getByTestId('add-dialog');
    expect(dialog.getAttribute('data-column')).toBe('Done');
    expect(capturedAddProps).toMatchObject({ calloutId: 'callout-1', taskColumn: 'Done' });
  });
});
