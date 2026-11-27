import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { SetStatusDialog } from './SetStatusDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderDialog = (statusMessage: string, showOnline = true) => {
  const onSave = vi.fn();
  const onOpenChange = vi.fn();
  const onShowOnlineChange = vi.fn();
  render(
    <SetStatusDialog
      open={true}
      onOpenChange={onOpenChange}
      statusMessage={statusMessage}
      onSave={onSave}
      showOnline={showOnline}
      onShowOnlineChange={onShowOnlineChange}
    />
  );
  return { onSave, onOpenChange, onShowOnlineChange };
};

describe('SetStatusDialog', () => {
  test('starts from the current status, focused, with the switch on and described as on', () => {
    renderDialog('Lunch');
    const input = screen.getByRole('textbox', { name: 'status.label' });
    expect(input).toHaveValue('Lunch');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('maxLength', '100');
    expect(screen.getByRole('dialog', { name: 'status.change' })).toHaveAccessibleDescription('status.showOnlineOn');
    expect(screen.getByRole('switch', { name: 'status.showOnline' })).toBeChecked();
  });

  test('switching off asks for the change at once, without saving or closing', async () => {
    const { onShowOnlineChange, onSave, onOpenChange } = renderDialog('Lunch');
    await userEvent.click(screen.getByRole('switch', { name: 'status.showOnline' }));

    expect(onShowOnlineChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('while off, the switch is described as off, there is no status to set, and close closes', async () => {
    const { onShowOnlineChange, onOpenChange } = renderDialog('', false);
    expect(screen.getByRole('dialog', { name: 'status.set' })).toHaveAccessibleDescription('status.showOnlineOff');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'status.save' })).not.toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: 'status.showOnline' });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(onShowOnlineChange).toHaveBeenCalledExactlyOnceWith(true);

    await userEvent.click(screen.getByRole('button', { name: 'actions.close' }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  test('without a status it is titled to set one and offers no clear', () => {
    renderDialog('');
    expect(screen.getByRole('dialog', { name: 'status.set' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'status.label' })).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'status.clear' })).not.toBeInTheDocument();
  });

  test('pressing Enter saves the trimmed status and closes', async () => {
    const { onSave, onOpenChange } = renderDialog('');
    await userEvent.type(screen.getByRole('textbox', { name: 'status.label' }), '  In a workshop {Enter}');

    expect(onSave).toHaveBeenCalledExactlyOnceWith('In a workshop');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('the save button saves the edited status and closes', async () => {
    const { onSave, onOpenChange } = renderDialog('Lunch');
    const input = screen.getByRole('textbox', { name: 'status.label' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Back at 3');
    await userEvent.click(screen.getByRole('button', { name: 'status.save' }));

    expect(onSave).toHaveBeenCalledExactlyOnceWith('Back at 3');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('clear saves an empty status and closes', async () => {
    const { onSave, onOpenChange } = renderDialog('Lunch');
    await userEvent.click(screen.getByRole('button', { name: 'status.clear' }));

    expect(onSave).toHaveBeenCalledExactlyOnceWith('');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('cancel with no edits closes at once, without saving', async () => {
    const { onSave, onOpenChange } = renderDialog('Lunch');
    await userEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  test('cancel with unsaved edits asks first: keeping stays open, discarding closes without saving', async () => {
    const { onSave, onOpenChange } = renderDialog('Lunch');
    await userEvent.type(screen.getByRole('textbox', { name: 'status.label' }), ' later');

    await userEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'dialogs.discardChanges.cancel' }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'status.label' })).toHaveValue('Lunch later');

    await userEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'dialogs.discardChanges.confirm' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });
});
