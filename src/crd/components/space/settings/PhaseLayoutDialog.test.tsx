import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PhaseLayoutDialog, type PhaseLayoutValues } from './PhaseLayoutDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.phaseName) return `${key}:${String(opts.phaseName)}`;
      if (opts?.widget) return `${key}:${String(opts.widget)}`;
      return key;
    },
  }),
}));

const defaultValues: PhaseLayoutValues = {
  descriptionCollapsed: false,
  showPublishDetails: true,
  sidebar: ['intent', 'index'],
};

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
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: [] });

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
    renderDialog({ descriptionCollapsed: true, showPublishDetails: false, sidebar: [] });

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
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: [] }, onSave);

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
    expect(onSave).toHaveBeenCalledWith({ descriptionCollapsed: true, showPublishDetails: false, sidebar: [] });
  });

  test('save without changes emits the original values unchanged', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: true, showPublishDetails: false, sidebar: [] }, onSave);

    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith({ descriptionCollapsed: true, showPublishDetails: false, sidebar: [] });
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
    const { unmount } = renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: [] }, onSave);

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
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: [] }, onSave);

    // The freshly mounted dialog must show the persisted value (Expanded = unchecked).
    const freshDescSwitch = screen.getByRole('switch', {
      name: 'layout.column.phaseLayout.descriptionHeight.switchLabel',
    });
    expect(freshDescSwitch).not.toBeChecked();
  });

  test('pre-fills the sidebar widget list from values.sidebar, selected first in saved order', () => {
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['events', 'intent'] });

    const list = screen.getByRole('list');
    const checkboxes = within(list).getAllByRole('checkbox');
    // events, intent selected (in that order) first; every other widget follows, unchecked.
    expect(checkboxes[0]).toHaveAccessibleName(
      'layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.events'
    );
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toHaveAccessibleName(
      'layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.intent'
    );
    expect(checkboxes[1]).toBeChecked();
    expect(
      checkboxes
        .slice(2)
        .every(checkbox => !checkbox.hasAttribute('data-state') || checkbox.getAttribute('data-state') !== 'checked')
    ).toBe(true);
  });

  test('toggling a selected widget off removes it from the save payload', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['intent', 'events'] }, onSave);

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.intent',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ sidebar: ['events'] }));
  });

  test('toggling an unselected widget on appends it to the save payload', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['intent'] }, onSave);

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.about',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ sidebar: ['intent', 'about'] }));
  });

  test('moving a widget down changes its position in the save payload', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['intent', 'events'] }, onSave);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'layout.column.sidebarDialog.moveDownAriaLabel:layout.column.sidebarDialog.widgets.intent',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ sidebar: ['events', 'intent'] }));
  });

  test('deselecting every widget saves an empty list (FR-016)', async () => {
    const onSave = vi.fn();
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['intent'] }, onSave);

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.intent',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ sidebar: [] }));
  });

  test('an empty selection shows the empty-state note', () => {
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: [] });

    expect(screen.getByText('layout.column.sidebarDialog.emptyNote')).toBeInTheDocument();
  });

  test('the boundary widgets have their reorder button disabled', () => {
    renderDialog({ descriptionCollapsed: false, showPublishDetails: true, sidebar: ['intent', 'events', 'about'] });

    expect(
      screen.getByRole('button', {
        name: 'layout.column.sidebarDialog.moveUpAriaLabel:layout.column.sidebarDialog.widgets.intent',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'layout.column.sidebarDialog.moveDownAriaLabel:layout.column.sidebarDialog.widgets.about',
      })
    ).toBeDisabled();
  });
});
