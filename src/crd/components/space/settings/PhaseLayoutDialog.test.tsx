import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PhaseLayoutDialog } from './PhaseLayoutDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.phaseName) return `${key}:${String(opts.phaseName)}`;
      return key;
    },
  }),
}));

const defaultValues = { descriptionCollapsed: false, showPublishDetails: true };

const renderDialog = (values = defaultValues, onSave = vi.fn(), onOpenChange = vi.fn()) =>
  render(
    <PhaseLayoutDialog
      open={true}
      onOpenChange={onOpenChange}
      phaseName="Knowledge Base"
      values={values}
      onSave={onSave}
    />
  );

describe('PhaseLayoutDialog', () => {
  test('renders pre-filled values — Expanded, publish details On', () => {
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true });

    const descSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    const detailsSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.publishDetails.switchLabel',
    });

    expect(descSwitch).not.toBeChecked();
    expect(detailsSwitch).toBeChecked();
  });

  test('renders pre-filled values — Collapsed, publish details Off', () => {
    renderDialog({ descriptionCollapsed: true, showPublishDetails: false });

    const descSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    const detailsSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.publishDetails.switchLabel',
    });

    expect(descSwitch).toBeChecked();
    expect(detailsSwitch).not.toBeChecked();
  });

  test('save emits the updated values after toggling both switches', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true }, onSave);

    const descSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    const detailsSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.publishDetails.switchLabel',
    });

    await userEvent.click(descSwitch);
    await userEvent.click(detailsSwitch);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({ descriptionCollapsed: true, showPublishDetails: false });
  });

  test('save without changes emits the original values unchanged', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: true, showPublishDetails: false }, onSave);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith({ descriptionCollapsed: true, showPublishDetails: false });
  });

  test('closes only AFTER the async save resolves (not before)', async () => {
    // A manually-controlled promise proves ordering — a `mockResolvedValue` would settle in
    // the same microtask flush, so a dialog that closed *before* awaiting would still pass.
    let resolveSave!: () => void;
    const savePromise = new Promise<void>(res => {
      resolveSave = res;
    });
    const onSave = vi.fn().mockReturnValue(savePromise);
    const onOpenChange = vi.fn();
    renderDialog(defaultValues, onSave, onOpenChange);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    // Save fired but is still pending → dialog must stay open.
    expect(onSave).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();

    // Pending UI (CW-4): the button's accessible name swaps to the saving key, disabled + aria-busy.
    const pendingButton = screen.getByRole('button', { name: 'layout.column.phaseLayout.saving' });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveAttribute('aria-busy', 'true');

    // Resolve the save → the dialog now closes.
    resolveSave();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test('stays open when the async save rejects (no silent discard)', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('persist failed'));
    const onOpenChange = vi.fn();
    renderDialog(defaultValues, onSave, onOpenChange);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledOnce();
    // Save failed → the dialog must NOT close.
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test('cancel emits nothing (onSave not called)', async () => {
    const onSave = vi.fn();
    renderDialog(defaultValues, onSave);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.cancel' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  test('cancel calls onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    renderDialog(defaultValues, vi.fn(), onOpenChange);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('dialog title includes the phase name', () => {
    renderDialog();
    // Our t() mock returns "key:phaseName" for keys with phaseName interpolation
    expect(screen.getByText('layout.column.phaseLayout.dialogTitle:Knowledge Base')).toBeInTheDocument();
  });

  test('reopen after cancel shows fresh values (not stale uncommitted edits)', async () => {
    // This test verifies that the key-remount strategy in LayoutPoolColumn works:
    // when the dialog is remounted (open false → true), useState re-seeds from `values`.
    // We simulate this by unmounting and re-mounting with the original values
    // after a cancel that left the internal state in a modified position.
    const onSave = vi.fn();
    const { unmount } = renderDialog({ descriptionCollapsed: false, showPublishDetails: true }, onSave);

    // Flip the switch without saving
    const descSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    await userEvent.click(descSwitch);
    expect(descSwitch).toBeChecked(); // now shows Collapsed (uncommitted)

    // Cancel without saving
    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.cancel' }));
    expect(onSave).not.toHaveBeenCalled();

    // Simulate the remount that LayoutPoolColumn performs via `key` on re-open.
    unmount();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true }, onSave);

    // The freshly mounted dialog must show the persisted value (Expanded = unchecked).
    const freshDescSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    expect(freshDescSwitch).not.toBeChecked();
  });
});
