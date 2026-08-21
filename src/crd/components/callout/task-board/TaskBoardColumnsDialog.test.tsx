import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key),
  }),
}));

// Capture the editor props so the test drives rename/reorder/add/delete
// callbacks and reads back the derived items + per-row errors.
let editorProps: Record<string, unknown> | undefined;
vi.mock('@/crd/components/common/SortableNameListEditor', () => ({
  SortableNameListEditor: (props: Record<string, unknown>) => {
    editorProps = props;
    const items = props.items as { id: string; name: string; deletable?: boolean }[];
    return (
      <div data-testid="editor">
        {items.map(item => (
          <div key={item.id} data-testid={`row-${item.id}`} data-deletable={String(item.deletable !== false)}>
            {item.name}
          </div>
        ))}
      </div>
    );
  },
}));

// Capture the confirmation dialog so the delete gate can be asserted + confirmed.
let confirmProps: Record<string, unknown> | undefined;
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({
  ConfirmationDialog: (props: Record<string, unknown>) => {
    confirmProps = props;
    return props.open ? (
      <button type="button" data-testid="confirm-delete" onClick={props.onConfirm as () => void}>
        confirm
      </button>
    ) : null;
  },
}));

import { TaskBoardColumnsDialog, type TaskBoardColumnsDialogProps } from './TaskBoardColumnsDialog';

function renderDialog(overrides: Partial<TaskBoardColumnsDialogProps> = {}) {
  const props: TaskBoardColumnsDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    columns: [{ name: 'Backlog' }, { name: 'Doing' }, { name: 'Done' }],
    onAddColumn: vi.fn().mockResolvedValue(undefined),
    onRenameColumn: vi.fn().mockResolvedValue(undefined),
    onReorderColumns: vi.fn().mockResolvedValue(undefined),
    onDeleteColumn: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<TaskBoardColumnsDialog {...props} />);
  return props;
}

/** Clicks Save and lets the async sweep settle. */
async function save() {
  await act(async () => {
    fireEvent.click(screen.getByText('columns.save'));
  });
}

afterEach(() => {
  editorProps = undefined;
  confirmProps = undefined;
});

describe('TaskBoardColumnsDialog', () => {
  it('seeds one editable row per column and protects the first from deletion', () => {
    renderDialog();
    expect(screen.getByTestId('row-col:Backlog').getAttribute('data-deletable')).toBe('false');
    expect(screen.getByTestId('row-col:Doing').getAttribute('data-deletable')).toBe('true');
    expect(screen.getByTestId('row-col:Done').getAttribute('data-deletable')).toBe('true');
  });

  it('flags an empty name, an overlong name, a comma, and a duplicate', () => {
    renderDialog();
    const rename = (name: string) =>
      act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', name));
    const currentError = () => (editorProps?.errorFor as (id: string) => string | undefined)('col:Doing');

    rename('   ');
    expect(currentError()).toBe('columns.validation.required');

    rename('x'.repeat(129));
    expect(currentError()).toBe('columns.validation.tooLong');

    rename('a,b');
    expect(currentError()).toBe('columns.validation.comma');

    rename('backlog'); // case-insensitive clash with "Backlog"
    expect(currentError()).toBe('columns.validation.duplicate');
  });

  it('renames changed rows and reorders on Save, then closes', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', 'In progress'));
    act(() => (editorProps?.onReorder as (ids: string[]) => void)(['col:Done', 'col:Backlog', 'col:Doing']));

    await save();

    expect(props.onRenameColumn).toHaveBeenCalledWith('Doing', 'In progress');
    // Reorder uses the final names, in the dragged order.
    expect(props.onReorderColumns).toHaveBeenCalledWith(['Done', 'Backlog', 'In progress']);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sequences renames before the reorder (rename resolves first)', async () => {
    const order: string[] = [];
    const props = renderDialog({
      onRenameColumn: vi.fn().mockImplementation(async () => {
        order.push('rename');
      }),
      onReorderColumns: vi.fn().mockImplementation(async () => {
        order.push('reorder');
      }),
    });
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', 'In progress'));
    act(() => (editorProps?.onReorder as (ids: string[]) => void)(['col:Done', 'col:Backlog', 'col:Doing']));

    await save();

    expect(order).toEqual(['rename', 'reorder']);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not emit a reorder for a pure rename (order unchanged)', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', 'In progress'));

    await save();

    expect(props.onRenameColumn).toHaveBeenCalledWith('Doing', 'In progress');
    expect(props.onReorderColumns).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not emit a reorder when only a column is appended', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('new:0', 'Review'));

    await save();

    expect(props.onAddColumn).toHaveBeenCalledWith('Review');
    // A newly added row lands at the end, matching the server's post-create
    // order, so no reorder is needed.
    expect(props.onReorderColumns).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and does not reorder when a create fails', async () => {
    const props = renderDialog({
      onAddColumn: vi.fn().mockRejectedValue(new Error('server rejected')),
    });
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('new:0', 'Review'));
    // Also reorder, so we can prove the reorder never fires after the failed create.
    act(() => (editorProps?.onReorder as (ids: string[]) => void)(['new:0', 'col:Backlog', 'col:Doing', 'col:Done']));

    await save();

    expect(props.onReorderColumns).not.toHaveBeenCalled();
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('creates a newly added row on Save (no rename call for it)', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('new:0', 'Review'));
    await save();

    expect(props.onAddColumn).toHaveBeenCalledWith('Review');
    expect(props.onRenameColumn).not.toHaveBeenCalled();
  });

  it('does not persist while any row is invalid', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', ''));
    await save();
    expect(props.onRenameColumn).not.toHaveBeenCalled();
    expect(props.onReorderColumns).not.toHaveBeenCalled();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('confirms before deleting an existing column and reflows to the first, firing the delete on Save', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onDelete as (id: string) => void)('col:Doing'));

    // The confirm dialog names the column and its reflow target.
    expect(confirmProps?.description).toContain('Doing');
    expect(confirmProps?.description).toContain('Backlog');

    // Confirming only queues the delete: the mutation does NOT fire yet and the
    // row disappears from the draft. Deferring the delete to the Save sweep is
    // what keeps other queued edits from being clobbered by the delete refetch.
    fireEvent.click(screen.getByTestId('confirm-delete'));
    expect(props.onDeleteColumn).not.toHaveBeenCalled();
    expect(screen.queryByTestId('row-col:Doing')).not.toBeInTheDocument();

    await save();
    expect(props.onDeleteColumn).toHaveBeenCalledWith('Doing');
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('preserves queued rename + add across a delete, issuing all of them on Save', async () => {
    const order: string[] = [];
    const props = renderDialog({
      onRenameColumn: vi.fn().mockImplementation(async () => {
        order.push('rename');
      }),
      onAddColumn: vi.fn().mockImplementation(async () => {
        order.push('add');
      }),
      onDeleteColumn: vi.fn().mockImplementation(async () => {
        order.push('delete');
      }),
    });

    // Queue a rename (Backlog→Icebox), an add (Review), then delete Doing.
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Backlog', 'Icebox'));
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('new:0', 'Review'));
    act(() => (editorProps?.onDelete as (id: string) => void)('col:Doing'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await save();

    // Every queued edit survives the delete and lands in the sweep.
    expect(props.onRenameColumn).toHaveBeenCalledWith('Backlog', 'Icebox');
    expect(props.onAddColumn).toHaveBeenCalledWith('Review');
    expect(props.onDeleteColumn).toHaveBeenCalledWith('Doing');
    // Deletes run after creates/renames.
    expect(order).toEqual(['rename', 'add', 'delete']);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not emit a reorder when a column is only deleted (surviving order unchanged)', async () => {
    const props = renderDialog();
    act(() => (editorProps?.onDelete as (id: string) => void)('col:Doing'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await save();

    expect(props.onDeleteColumn).toHaveBeenCalledWith('Doing');
    expect(props.onReorderColumns).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and preserves the draft when a delete fails on Save', async () => {
    const props = renderDialog({
      onDeleteColumn: vi.fn().mockRejectedValue(new Error('server rejected')),
    });
    act(() => (editorProps?.onDelete as (id: string) => void)('col:Doing'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await save();

    expect(props.onDeleteColumn).toHaveBeenCalledWith('Doing');
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('drops a never-persisted new row without a confirmation or a delete call', () => {
    const props = renderDialog();
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onDelete as (id: string) => void)('new:0'));

    expect(screen.queryByTestId('confirm-delete')).not.toBeInTheDocument();
    expect(props.onDeleteColumn).not.toHaveBeenCalled();
    // The row is gone from the editor's item list.
    expect(screen.queryByTestId('row-new:0')).not.toBeInTheDocument();
  });
});
