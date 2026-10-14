import { DndContext } from '@dnd-kit/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { LayoutPoolColumn } from './LayoutPoolColumn';
import type { ColumnMenuActions } from './SpaceSettingsLayoutView.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Tiptap is heavy in jsdom: a textarea stands in for the editor, and the error
// prop is rendered so the dialog's live message can be asserted.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: (props: { value: string; onChange: (next: string) => void; maxLength?: number; error?: string }) => (
    <>
      <textarea
        aria-label="description-editor"
        data-max-length={props.maxLength}
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
      {props.error && <p>{props.error}</p>}
    </>
  ),
}));

vi.mock('./PhasePostTemplateDialog', () => ({
  PhasePostTemplateDialog: () => null,
}));

const MAX = 20;
const MAX_LENGTH_MESSAGE = 'components.wysiwyg-editor.validation.maxLength';

const actions: ColumnMenuActions = {
  onChangeActivePhase: vi.fn(),
  onSetAsDefaultCalloutTemplate: vi.fn(),
  onOpenDefaultCalloutTemplatePicker: vi.fn(),
  onSaveColumnDetails: vi.fn().mockResolvedValue(undefined),
  onSaveLayout: vi.fn().mockResolvedValue(undefined),
  onDeletePhase: vi.fn().mockResolvedValue(undefined),
};

const openEditDetails = async () => {
  render(
    <DndContext>
      <LayoutPoolColumn
        column={{ id: 'col-1', title: 'Archive', description: '', isCurrentPhase: false, callouts: [] }}
        otherColumns={[]}
        showDescription={false}
        onMoveToColumn={vi.fn()}
        onViewPost={vi.fn()}
        columnMenuActions={actions}
        descriptionMaxLength={MAX}
      />
    </DndContext>
  );
  await userEvent.click(screen.getByRole('button', { name: 'layout.column.menu' }));
  await userEvent.click(screen.getByText('layout.column.editDetails.menuLabel'));
  const editor = screen.getByLabelText('description-editor');
  return {
    editor,
    type: (value: string) => fireEvent.change(editor, { target: { value } }),
    save: () => screen.getByRole('button', { name: 'layout.column.editDetails.save' }),
  };
};

describe('LayoutPoolColumn — Edit Details description limit', () => {
  test('hands the limit to the editor so its progress ring shows', async () => {
    const { editor } = await openEditDetails();
    expect(editor).toHaveAttribute('data-max-length', String(MAX));
  });

  test('at the limit Save stays enabled and no error shows', async () => {
    const dialog = await openEditDetails();
    dialog.type('a'.repeat(MAX));
    expect(dialog.save()).toBeEnabled();
    expect(screen.queryByText(MAX_LENGTH_MESSAGE)).toBeNull();
  });

  test('past the limit Save is blocked and the error shows live', async () => {
    const dialog = await openEditDetails();
    dialog.type('a'.repeat(MAX + 1));
    expect(dialog.save()).toBeDisabled();
    expect(screen.getByText(MAX_LENGTH_MESSAGE)).toBeInTheDocument();
  });
});
