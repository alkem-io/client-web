import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FormSettingsDialog } from './FormSettingsDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'count' in params ? `${key}#${params.count}` : key,
  }),
}));

const renderDialog = (overrides: Partial<React.ComponentProps<typeof FormSettingsDialog>> = {}) => {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    visibility: 'ADMINS' as const,
    onVisibilityChange: vi.fn(),
    responseMode: 'SINGLE' as const,
    onResponseModeChange: vi.fn(),
    state: 'OPEN' as const,
    onStateChange: vi.fn(),
    defaultCollapsed: false,
    onDefaultCollapsedChange: vi.fn(),
    ...overrides,
  };
  render(<FormSettingsDialog {...props} />);
  return props;
};

describe('FormSettingsDialog', () => {
  test('shows the current selection with helper text naming who reads', () => {
    renderDialog();
    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.ADMINS' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'formForm.settings.responseMode.SINGLE' })).toBeChecked();
    expect(screen.getByText('formForm.settings.visibilityHelp.ADMINS')).toBeInTheDocument();
    expect(screen.getByText('formForm.settings.visibilityHelp.MEMBERS')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'formForm.settings.stateOpen' })).toBeChecked();
  });

  test('the two radio groups are labelled', () => {
    renderDialog();
    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAccessibleName('formForm.settings.visibilityHeading');
    expect(groups[1]).toHaveAccessibleName('formForm.settings.responseModeHeading');
  });

  test('fires the change callbacks', async () => {
    const props = renderDialog();

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));
    expect(props.onVisibilityChange).toHaveBeenCalledWith('MEMBERS');

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.responseMode.MULTIPLE' }));
    expect(props.onResponseModeChange).toHaveBeenCalledWith('MULTIPLE');

    await userEvent.click(screen.getByRole('switch', { name: 'formForm.settings.stateOpen' }));
    expect(props.onStateChange).toHaveBeenCalledWith('CLOSED');
  });

  test('both directions of both settings are enabled, with no disabled reason', () => {
    renderDialog({ confirmWidening: true, existingResponseCount: 4 });
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' })).toHaveAccessibleDescription(
      'formForm.settings.visibilityHelp.MEMBERS'
    );
  });

  test('widening with confirmWidening asks first; cancel keeps Admins only', async () => {
    const props = renderDialog({ confirmWidening: true, existingResponseCount: 4 });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('formForm.settings.widenConfirm.description#4')).toBeInTheDocument();
    expect(props.onVisibilityChange).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'dialogs.cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(props.onVisibilityChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.ADMINS' })).toBeChecked();
  });

  test('confirming the widening sets the pending value', async () => {
    const props = renderDialog({ confirmWidening: true, existingResponseCount: 4 });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));
    await userEvent.click(await screen.findByRole('button', { name: 'formForm.settings.widenConfirm.confirm' }));

    expect(props.onVisibilityChange).toHaveBeenCalledWith('MEMBERS');
  });

  test('without a known count the confirmation names no number', async () => {
    renderDialog({ confirmWidening: true });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));
    expect(await screen.findByText('formForm.settings.widenConfirm.descriptionNoCount')).toBeInTheDocument();
  });

  test('widening without confirmWidening calls straight through', async () => {
    const props = renderDialog({ confirmWidening: false });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(props.onVisibilityChange).toHaveBeenCalledWith('MEMBERS');
  });

  test('narrowing never asks', async () => {
    const props = renderDialog({ visibility: 'MEMBERS', confirmWidening: true, existingResponseCount: 4 });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.ADMINS' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(props.onVisibilityChange).toHaveBeenCalledWith('ADMINS');
  });

  test('switching multiple responses to one per person is allowed', async () => {
    const props = renderDialog({ responseMode: 'MULTIPLE' });

    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.responseMode.SINGLE' }));
    expect(props.onResponseModeChange).toHaveBeenCalledWith('SINGLE');
  });

  test('the collapsed-by-default switch shows the setting and fires its callback', async () => {
    const props = renderDialog({ defaultCollapsed: false });

    const toggle = screen.getByRole('switch', { name: 'formForm.settings.defaultCollapsed' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toHaveAccessibleDescription('formForm.settings.defaultCollapsedHelp');
    await userEvent.click(toggle);
    expect(props.onDefaultCollapsedChange).toHaveBeenCalledWith(true);
  });

  test('read-only disables every control', () => {
    renderDialog({ readOnly: true });
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    for (const toggle of screen.getAllByRole('switch')) expect(toggle).toBeDisabled();
  });
});
