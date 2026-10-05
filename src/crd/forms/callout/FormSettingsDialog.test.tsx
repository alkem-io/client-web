import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FormSettingsDialog } from './FormSettingsDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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
    canWidenVisibility: true,
    canSwitchToSingle: true,
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

  test('widening is disabled with a visible reason and does not fire', async () => {
    const props = renderDialog({ canWidenVisibility: false, widenDisabledReason: 'cannot widen' });

    const members = screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' });
    expect(members).toBeDisabled();
    expect(screen.getByText('cannot widen')).toBeInTheDocument();
    await userEvent.click(members);
    expect(props.onVisibilityChange).not.toHaveBeenCalled();
  });

  test('switching to a single response is disabled with a visible reason', async () => {
    const props = renderDialog({
      responseMode: 'MULTIPLE',
      canSwitchToSingle: false,
      switchDisabledReason: 'someone has several',
    });

    const single = screen.getByRole('radio', { name: 'formForm.settings.responseMode.SINGLE' });
    expect(single).toBeDisabled();
    expect(screen.getByText('someone has several')).toBeInTheDocument();
    await userEvent.click(single);
    expect(props.onResponseModeChange).not.toHaveBeenCalled();
  });

  test('an enabled option is described only by its helper text, never by the absent disabled reason', () => {
    renderDialog({ canWidenVisibility: true, widenDisabledReason: 'cannot widen' });

    const members = screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' });
    expect(members).toHaveAttribute('aria-describedby', `${members.id}-description`);
    expect(members).toHaveAccessibleDescription('formForm.settings.visibilityHelp.MEMBERS');
  });

  test('a disabled option is described by its helper text and its reason', () => {
    renderDialog({ canWidenVisibility: false, widenDisabledReason: 'cannot widen' });

    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' })).toHaveAccessibleDescription(
      'formForm.settings.visibilityHelp.MEMBERS cannot widen'
    );
  });

  test('read-only disables every control', () => {
    renderDialog({ readOnly: true });
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
