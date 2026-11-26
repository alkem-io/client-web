import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The board post is read from the cache (021 H19); the legacy TaskBoardData query is absent from the mock below.
const useCachedPost = vi.fn();
vi.mock('@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails', () => ({
  useCachedPost: (id: string) => useCachedPost(id),
}));
const createColumnMock = vi.fn();
const renameColumnMock = vi.fn();
const deleteColumnMock = vi.fn();
const reorderColumnsMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateTaskColumnOnCalloutMutation: () => [createColumnMock, {}] as const,
  useUpdateTaskColumnOnCalloutMutation: () => [renameColumnMock, {}] as const,
  useDeleteTaskColumnOnCalloutMutation: () => [deleteColumnMock, {}] as const,
  useUpdateTaskColumnsSortOrderOnCalloutMutation: () => [reorderColumnsMock, {}] as const,
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// Capture the props the column-management dialog is mounted with so the wiring
// of the four column mutations can be asserted without a real dialog render.
let capturedColumnsProps: Record<string, unknown> | undefined;
vi.mock('@/crd/components/callout/task-board/TaskBoardColumnsDialog', () => ({
  TaskBoardColumnsDialog: (props: Record<string, unknown>) => {
    capturedColumnsProps = props;
    return props.open ? <div data-testid="columns-dialog" /> : null;
  },
}));

import { TaskBoardColumnsConnector } from './TaskBoardColumnsConnector';
import { TaskBoardManageColumnsButton } from './TaskBoardManageColumnsButton';

function boardPost(manageColumns = true) {
  return {
    id: 'callout-1',
    contentKind: 'task_board',
    can: { manageColumns },
    content: {
      __typename: 'TaskBoardContent',
      columns: [
        { id: 'done', name: 'Done', sortOrder: 1 },
        { id: 'backlog', name: 'Backlog', sortOrder: 0 },
      ],
      tasks: [],
    },
  };
}

afterEach(() => {
  useCachedPost.mockReset();
  createColumnMock.mockReset();
  renameColumnMock.mockReset();
  deleteColumnMock.mockReset();
  reorderColumnsMock.mockReset();
  capturedColumnsProps = undefined;
});

describe('TaskBoardColumnsConnector', () => {
  it("feeds the dialog the board's columns in their order and wires the four mutations", () => {
    useCachedPost.mockReturnValue(boardPost());
    render(<TaskBoardColumnsConnector calloutId="callout-1" open={true} onOpenChange={() => {}} />);

    expect(useCachedPost).toHaveBeenCalledWith('callout-1');
    expect(capturedColumnsProps?.columns).toEqual([{ name: 'Backlog' }, { name: 'Done' }]);

    (capturedColumnsProps?.onAddColumn as (name: string) => void)('Review');
    expect(createColumnMock).toHaveBeenCalledWith({
      variables: { columnData: { calloutID: 'callout-1', name: 'Review' } },
    });

    (capturedColumnsProps?.onRenameColumn as (a: string, b: string) => void)('Done', 'Shipped');
    expect(renameColumnMock).toHaveBeenCalledWith({
      variables: { columnData: { calloutID: 'callout-1', currentName: 'Done', newName: 'Shipped' } },
    });

    (capturedColumnsProps?.onReorderColumns as (names: string[]) => void)(['Done', 'Backlog']);
    expect(reorderColumnsMock).toHaveBeenCalledWith({
      variables: { sortOrderData: { calloutID: 'callout-1', columnNames: ['Done', 'Backlog'] } },
    });

    (capturedColumnsProps?.onDeleteColumn as (name: string) => void)('Done');
    expect(deleteColumnMock).toHaveBeenCalledWith({
      variables: { columnData: { calloutID: 'callout-1', name: 'Done' } },
    });
  });

  it('passes the controlled open state through to the dialog', () => {
    useCachedPost.mockReturnValue(boardPost());
    const onOpenChange = vi.fn();
    render(<TaskBoardColumnsConnector calloutId="callout-1" open={false} onOpenChange={onOpenChange} />);
    expect(capturedColumnsProps?.open).toBe(false);
    expect(capturedColumnsProps?.onOpenChange).toBe(onOpenChange);
  });
});

describe('TaskBoardManageColumnsButton', () => {
  it('is offered only when the board allows managing its columns', () => {
    useCachedPost.mockReturnValue(boardPost(false));
    const { rerender } = render(<TaskBoardManageColumnsButton calloutId="callout-1" />);
    expect(screen.queryByRole('button', { name: 'columns.manage' })).not.toBeInTheDocument();

    useCachedPost.mockReturnValue(boardPost(true));
    rerender(<TaskBoardManageColumnsButton calloutId="callout-1" />);
    expect(screen.getByRole('button', { name: 'columns.manage' })).toBeInTheDocument();
  });
});
