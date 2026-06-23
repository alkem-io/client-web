import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { LayoutPoolColumn } from './LayoutPoolColumn';
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
        onRenameColumn={vi.fn()}
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
