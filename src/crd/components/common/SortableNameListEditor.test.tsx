import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type NameListItem, SortableNameListEditor, type SortableNameListEditorProps } from './SortableNameListEditor';

function renderEditor(overrides: Partial<SortableNameListEditorProps> = {}) {
  const items: NameListItem[] = overrides.items ?? [
    { id: '1', name: 'Backlog', deletable: false, deleteDisabledReason: 'first column' },
    { id: '2', name: 'Doing' },
    { id: '3', name: 'Done' },
  ];
  const props = {
    items,
    onRename: vi.fn(),
    onReorder: vi.fn(),
    onDelete: vi.fn(),
    onAdd: vi.fn(),
    addLabel: 'Add column',
    dragLabel: 'Reorder',
    deleteLabel: 'Delete',
    nameLabel: 'Column name',
    namePlaceholder: 'Name',
    ...overrides,
  };
  render(<SortableNameListEditor {...props} />);
  return props;
}

describe('SortableNameListEditor', () => {
  it('renders one editable row per item in order', () => {
    renderEditor();
    const inputs = screen.getAllByLabelText('Column name') as HTMLInputElement[];
    expect(inputs.map(i => i.value)).toEqual(['Backlog', 'Doing', 'Done']);
  });

  it('renames a row through the onRename callback', () => {
    const { onRename } = renderEditor();
    const inputs = screen.getAllByLabelText('Column name');
    fireEvent.change(inputs[1], { target: { value: 'In progress' } });
    expect(onRename).toHaveBeenCalledWith('2', 'In progress');
  });

  it('deletes a row through the onDelete callback', () => {
    const { onDelete } = renderEditor();
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[2]);
    expect(onDelete).toHaveBeenCalledWith('3');
  });

  it('disables delete on a non-deletable row and surfaces the reason', () => {
    renderEditor();
    const deleteButtons = screen.getAllByLabelText('Delete') as HTMLButtonElement[];
    expect(deleteButtons[0].disabled).toBe(true);
    expect(deleteButtons[0].getAttribute('title')).toBe('first column');
    expect(deleteButtons[1].disabled).toBe(false);
  });

  it('adds a row through the onAdd callback', () => {
    const { onAdd } = renderEditor();
    fireEvent.click(screen.getByText('Add column'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('disables the add control at maxItems', () => {
    renderEditor({ maxItems: 3 });
    const addButton = screen.getByText('Add column').closest('button') as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);
  });

  it('shows the validation error only after the row is touched (not immediately)', () => {
    renderEditor({ errorFor: id => (id === '2' ? 'Duplicate name' : undefined) });
    const inputs = screen.getAllByLabelText('Column name');
    // Untouched: an invalid row does not flash red before the user interacts.
    expect(inputs[1].getAttribute('aria-invalid')).toBe('false');
    expect(screen.queryByText('Duplicate name')).not.toBeInTheDocument();
    // Touching the row (blur) surfaces the error and marks the input invalid.
    fireEvent.blur(inputs[1]);
    expect(inputs[1].getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Duplicate name')).toBeInTheDocument();
    // A valid, untouched row stays clean.
    expect(inputs[0].getAttribute('aria-invalid')).toBe('false');
  });
});
