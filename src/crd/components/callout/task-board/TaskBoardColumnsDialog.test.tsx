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
    onAddColumn: vi.fn(),
    onRenameColumn: vi.fn(),
    onReorderColumns: vi.fn(),
    onDeleteColumn: vi.fn(),
    ...overrides,
  };
  render(<TaskBoardColumnsDialog {...props} />);
  return props;
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

  it('renames changed rows and reorders on Save, then closes', () => {
    const props = renderDialog();
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', 'In progress'));
    act(() => (editorProps?.onReorder as (ids: string[]) => void)(['col:Done', 'col:Backlog', 'col:Doing']));

    fireEvent.click(screen.getByText('columns.save'));

    expect(props.onRenameColumn).toHaveBeenCalledWith('Doing', 'In progress');
    // Reorder uses the final names, in the dragged order.
    expect(props.onReorderColumns).toHaveBeenCalledWith(['Done', 'Backlog', 'In progress']);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('creates a newly added row on Save (no rename call for it)', () => {
    const props = renderDialog();
    act(() => (editorProps?.onAdd as () => void)());
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('new:0', 'Review'));
    fireEvent.click(screen.getByText('columns.save'));

    expect(props.onAddColumn).toHaveBeenCalledWith('Review');
    expect(props.onRenameColumn).not.toHaveBeenCalled();
  });

  it('does not persist while any row is invalid', () => {
    const props = renderDialog();
    act(() => (editorProps?.onRename as (id: string, name: string) => void)('col:Doing', ''));
    fireEvent.click(screen.getByText('columns.save'));
    expect(props.onRenameColumn).not.toHaveBeenCalled();
    expect(props.onReorderColumns).not.toHaveBeenCalled();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('confirms before deleting an existing column and reflows to the first', () => {
    const props = renderDialog();
    act(() => (editorProps?.onDelete as (id: string) => void)('col:Doing'));

    // The confirm dialog names the column and its reflow target.
    expect(confirmProps?.description).toContain('Doing');
    expect(confirmProps?.description).toContain('Backlog');

    fireEvent.click(screen.getByTestId('confirm-delete'));
    expect(props.onDeleteColumn).toHaveBeenCalledWith('Doing');
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
