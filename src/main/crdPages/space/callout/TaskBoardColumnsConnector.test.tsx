import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const useTaskBoardDataQuery = vi.fn();
const createColumnMock = vi.fn();
const renameColumnMock = vi.fn();
const deleteColumnMock = vi.fn();
const reorderColumnsMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useTaskBoardDataQuery: (options: unknown) => useTaskBoardDataQuery(options),
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

function boardCallout() {
  return {
    id: 'callout-1',
    classification: {
      id: 'c',
      tagsets: [{ id: 't', name: 'task', allowedValues: ['Backlog', 'Done'] }],
    },
  };
}

afterEach(() => {
  useTaskBoardDataQuery.mockReset();
  createColumnMock.mockReset();
  renameColumnMock.mockReset();
  deleteColumnMock.mockReset();
  reorderColumnsMock.mockReset();
  capturedColumnsProps = undefined;
});

describe('TaskBoardColumnsConnector', () => {
  it('feeds the dialog the columns from the task tagset and wires the four mutations', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardColumnsConnector calloutId="callout-1" open={true} onOpenChange={() => {}} />);

    // Columns come from the tagset's allowedValues, in order.
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
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    const onOpenChange = vi.fn();
    render(<TaskBoardColumnsConnector calloutId="callout-1" open={false} onOpenChange={onOpenChange} />);
    expect(capturedColumnsProps?.open).toBe(false);
    expect(capturedColumnsProps?.onOpenChange).toBe(onOpenChange);
  });
});
