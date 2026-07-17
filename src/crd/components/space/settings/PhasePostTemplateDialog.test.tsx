import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PhasePostTemplateDialog } from './PhasePostTemplateDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.phaseName) return `${key}:${String(opts.phaseName)}`;
      return key;
    },
  }),
}));

const defaultTemplate = { id: 'tpl-1', displayName: 'My Template' };

const renderDialog = (
  opts: {
    currentTemplate?: { id: string; displayName: string } | null;
    onChooseTemplate?: () => void;
    onClearTemplate?: () => void;
    onOpenChange?: (open: boolean) => void;
  } = {}
) =>
  render(
    <PhasePostTemplateDialog
      open={true}
      onOpenChange={opts.onOpenChange ?? vi.fn()}
      phaseName="Knowledge Base"
      currentTemplate={opts.currentTemplate}
      onChooseTemplate={opts.onChooseTemplate ?? vi.fn()}
      onClearTemplate={opts.onClearTemplate ?? vi.fn()}
    />
  );

describe('PhasePostTemplateDialog', () => {
  // ── "Choose template" is always visible ──────────────────────────────────

  test('shows "Choose template" button when no template is set', () => {
    renderDialog({ currentTemplate: null });
    expect(screen.getByText('layout.column.postTemplate.choose')).toBeInTheDocument();
  });

  test('shows "Choose template" button when a template is set', () => {
    renderDialog({ currentTemplate: defaultTemplate });
    expect(screen.getByText('layout.column.postTemplate.choose')).toBeInTheDocument();
  });

  // ── "Clear template" visibility gates ────────────────────────────────────

  test('hides "Clear template" when no template is set (null)', () => {
    renderDialog({ currentTemplate: null });
    expect(screen.queryByText('layout.column.postTemplate.clear')).not.toBeInTheDocument();
  });

  test('hides "Clear template" when no template is set (undefined)', () => {
    renderDialog({ currentTemplate: undefined });
    expect(screen.queryByText('layout.column.postTemplate.clear')).not.toBeInTheDocument();
  });

  test('shows "Clear template" when a template is already set', () => {
    renderDialog({ currentTemplate: defaultTemplate });
    expect(screen.getByText('layout.column.postTemplate.clear')).toBeInTheDocument();
  });

  // ── "Choose template" fires handler and closes dialog ────────────────────

  test('clicking "Choose template" calls onChooseTemplate', async () => {
    const onChooseTemplate = vi.fn();
    renderDialog({ currentTemplate: null, onChooseTemplate });
    await userEvent.click(screen.getByText('layout.column.postTemplate.choose'));
    expect(onChooseTemplate).toHaveBeenCalledOnce();
  });

  test('clicking "Choose template" closes the dialog', async () => {
    const onOpenChange = vi.fn();
    renderDialog({ currentTemplate: null, onOpenChange });
    await userEvent.click(screen.getByText('layout.column.postTemplate.choose'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ── "Clear template" requires confirmation (FR-012) ──────────────────────

  test('clicking "Clear template" shows a confirmation dialog (onClearTemplate NOT called yet)', async () => {
    const onClearTemplate = vi.fn();
    renderDialog({ currentTemplate: defaultTemplate, onClearTemplate });
    await userEvent.click(screen.getByText('layout.column.postTemplate.clear'));
    // Confirmation dialog should now be visible
    expect(screen.getByText('layout.column.postTemplate.clearConfirm.title')).toBeInTheDocument();
    // Handler must NOT have been called yet
    expect(onClearTemplate).not.toHaveBeenCalled();
  });

  test('confirming "Clear template" calls onClearTemplate', async () => {
    const onClearTemplate = vi.fn();
    renderDialog({ currentTemplate: defaultTemplate, onClearTemplate });
    await userEvent.click(screen.getByText('layout.column.postTemplate.clear'));
    await userEvent.click(screen.getByText('layout.column.postTemplate.clearConfirm.confirm'));
    expect(onClearTemplate).toHaveBeenCalledOnce();
  });

  test('confirming "Clear template" closes the dialog', async () => {
    const onOpenChange = vi.fn();
    renderDialog({ currentTemplate: defaultTemplate, onOpenChange });
    await userEvent.click(screen.getByText('layout.column.postTemplate.clear'));
    await userEvent.click(screen.getByText('layout.column.postTemplate.clearConfirm.confirm'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('cancelling the confirmation does NOT call onClearTemplate', async () => {
    const onClearTemplate = vi.fn();
    renderDialog({ currentTemplate: defaultTemplate, onClearTemplate });
    await userEvent.click(screen.getByText('layout.column.postTemplate.clear'));
    await userEvent.click(screen.getByText('layout.column.postTemplate.clearConfirm.cancel'));
    expect(onClearTemplate).not.toHaveBeenCalled();
  });

  // ── Dialog title includes phase name ─────────────────────────────────────

  test('dialog title includes the phase name', () => {
    renderDialog({ currentTemplate: null });
    expect(screen.getByText('layout.column.postTemplate.dialogTitle:Knowledge Base')).toBeInTheDocument();
  });
});
