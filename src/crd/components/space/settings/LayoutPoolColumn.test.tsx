import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { isColumnTitleTooShort, LayoutPoolColumn } from './LayoutPoolColumn';
import type { ColumnMenuActions, LayoutPoolColumn as LayoutPoolColumnData } from './SpaceSettingsLayoutView.types';

// i18n: return the key so we can assert on the deleteTab/deletePhase menu-label key directly.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// MarkdownEditor pulls in Tiptap (heavy + flaky in jsdom). Stub it — the column's
// menu/Delete gating is independent of the editor.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

// PhasePostTemplateDialog is tested in its own file; stub it here so the
// LayoutPoolColumn tests don't depend on Radix Dialog internals.
vi.mock('./PhasePostTemplateDialog', () => ({
  PhasePostTemplateDialog: () => null,
}));

const baseColumn = (overrides?: Partial<LayoutPoolColumnData>): LayoutPoolColumnData => ({
  id: 'col-1',
  title: 'Archive',
  description: '',
  isCurrentPhase: false,
  callouts: [],
  ...overrides,
});

const baseActions = (overrides?: Partial<ColumnMenuActions>): ColumnMenuActions => ({
  onChangeActivePhase: vi.fn(),
  onSetAsDefaultCalloutTemplate: vi.fn(),
  onOpenDefaultCalloutTemplatePicker: vi.fn(),
  onSaveColumnDetails: vi.fn().mockResolvedValue(undefined),
  onSaveLayout: vi.fn().mockResolvedValue(undefined),
  onDeletePhase: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const renderColumn = (column: LayoutPoolColumnData, actions: ColumnMenuActions, entityNoun: 'tab' | 'phase') =>
  render(
    <DndContext>
      <LayoutPoolColumn
        column={column}
        otherColumns={[]}
        showDescription={false}
        onMoveToColumn={vi.fn()}
        onViewPost={vi.fn()}
        columnMenuActions={actions}
        entityNoun={entityNoun}
      />
    </DndContext>
  );

const openMenu = async () => {
  const trigger = screen.getByRole('button', { name: 'layout.column.menu' });
  await userEvent.click(trigger);
};

describe('LayoutPoolColumn — Delete affordance gating (FR-005/FR-006)', () => {
  test('protected L0 column (isDeletable=false) shows NO Delete entry even when handler is present', async () => {
    renderColumn(baseColumn({ isDeletable: false }), baseActions(), 'tab');
    await openMenu();
    expect(screen.queryByText('layout.column.deleteTab.menuLabel')).toBeNull();
    expect(screen.queryByText('layout.column.deletePhase.menuLabel')).toBeNull();
  });

  test('additional L0 tab (isDeletable=true) shows the tab-worded Delete entry', async () => {
    renderColumn(baseColumn({ isDeletable: true }), baseActions(), 'tab');
    await openMenu();
    expect(screen.getByText('layout.column.deleteTab.menuLabel')).toBeInTheDocument();
  });

  test('subspace phase (isDeletable undefined) shows the phase-worded Delete entry — unchanged behaviour', async () => {
    renderColumn(baseColumn({ isDeletable: undefined }), baseActions(), 'phase');
    await openMenu();
    expect(screen.getByText('layout.column.deletePhase.menuLabel')).toBeInTheDocument();
  });

  test('no Delete entry when the delete handler is absent (capability off), regardless of isDeletable', async () => {
    renderColumn(baseColumn({ isDeletable: true }), baseActions({ onDeletePhase: undefined }), 'tab');
    await openMenu();
    expect(screen.queryByText('layout.column.deleteTab.menuLabel')).toBeNull();
  });
});

describe('LayoutPoolColumn — menu order (US3-AS1, FR-010)', () => {
  test('menu contains Layout and Post Template entries in the correct relative order', async () => {
    renderColumn(baseColumn(), baseActions(), 'phase');
    await openMenu();

    // All four entries must be present
    const setActive = screen.getByText('layout.column.activePhase.set');
    const editDetails = screen.getByText('layout.column.editDetails.menuLabel');
    const layout = screen.getByText('layout.column.phaseLayout.menuLabel');
    const postTemplate = screen.getByText('layout.column.postTemplate.menuLabel');

    // Verify DOM order: set-active → edit-details → layout → post-template
    const pairs: Array<[Element, Element]> = [
      [setActive, editDetails],
      [editDetails, layout],
      [layout, postTemplate],
    ];
    for (const [a, b] of pairs) {
      expect(a.compareDocumentPosition(b)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });

  test('Post Template menu entry is present and triggers no immediate mutation', async () => {
    const actions = baseActions();
    renderColumn(baseColumn(), actions, 'phase');
    await openMenu();
    const postTemplateItem = screen.getByText('layout.column.postTemplate.menuLabel');
    await userEvent.click(postTemplateItem);
    // Clicking "Post Template" opens the dialog — it must NOT directly call the template picker
    expect(actions.onOpenDefaultCalloutTemplatePicker).not.toHaveBeenCalled();
    expect(actions.onSetAsDefaultCalloutTemplate).not.toHaveBeenCalled();
  });
});

describe('isColumnTitleTooShort — Edit Details title minimum', () => {
  test.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['one letter', 'a'],
    ['two letters', 'ab'],
    ['two letters padded with spaces', '  ab  '],
  ])('%s is too short', (_label, title) => {
    expect(isColumnTitleTooShort(title)).toBe(true);
  });

  test.each([
    ['three letters', 'abc'],
    ['regular title', 'Discussion'],
    ['two letters plus emoji', 'ab🎉'],
  ])('%s is accepted', (_label, title) => {
    expect(isColumnTitleTooShort(title)).toBe(false);
  });

  test.each([
    ['single simple emoji', '🎉'],
    ['flag (two regional indicators)', '🇳🇱'],
    ['skin-tone modifier sequence', '👍🏽'],
    ['ZWJ family sequence', '👩‍👩‍👦'],
    ['keycap sequence', '1️⃣'],
    ['text symbol forced emoji via VS-16', '❤️'],
    ['two emoji', '🎉🚀'],
    ['emoji padded with spaces', ' 🎉 '],
  ])('emoji-only title (%s) is exempt from the minimum', (_label, title) => {
    expect(isColumnTitleTooShort(title)).toBe(false);
  });

  test.each([
    ['single digit', '1'],
    ['two digits', '12'],
    ['hash', '#'],
    ['asterisk', '*'],
    ['digits and hash', '#1'],
  ])('keycap-component-only title (%s) does NOT count as emoji and is too short', (_label, title) => {
    expect(isColumnTitleTooShort(title)).toBe(true);
  });
});
