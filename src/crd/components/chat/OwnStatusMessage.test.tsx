import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OwnStatusMessage } from './OwnStatusMessage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderControl = (statusMessage: string) => {
  const onSave = vi.fn();
  render(<OwnStatusMessage statusMessage={statusMessage} onSave={onSave} />);
  return onSave;
};

describe('OwnStatusMessage', () => {
  test('without a status it prompts to set one and offers no clear', () => {
    renderControl('');
    expect(screen.getByRole('button', { name: 'status.set' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'status.clear' })).not.toBeInTheDocument();
  });

  test('typing and pressing Enter saves the trimmed status and leaves edit mode', async () => {
    const onSave = renderControl('');
    await userEvent.click(screen.getByRole('button', { name: 'status.set' }));
    expect(screen.getByText('status.hint')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: 'status.label' }), '  In a workshop {Enter}');

    expect(onSave).toHaveBeenCalledWith('In a workshop');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('the save button commits the edited status', async () => {
    const onSave = renderControl('Lunch');
    await userEvent.click(screen.getByRole('button', { name: 'status.edit' }));
    const input = screen.getByRole('textbox', { name: 'status.label' });
    expect(input).toHaveValue('Lunch');

    await userEvent.clear(input);
    await userEvent.type(input, 'Back at 3');
    await userEvent.click(screen.getByRole('button', { name: 'status.save' }));

    expect(onSave).toHaveBeenCalledWith('Back at 3');
  });

  test('Escape cancels without saving, and claims the key from the chat panel', async () => {
    const onSave = renderControl('Lunch');
    const panelEscape = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
    window.addEventListener('keydown', panelEscape);
    await userEvent.click(screen.getByRole('button', { name: 'status.edit' }));
    await userEvent.type(screen.getByRole('textbox'), ' later{Escape}');
    window.removeEventListener('keydown', panelEscape);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(panelEscape).toHaveLastReturnedWith(true);
  });

  test('the cancel button leaves edit mode without saving', async () => {
    const onSave = renderControl('Lunch');
    await userEvent.click(screen.getByRole('button', { name: 'status.edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'actions.cancel' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('clear saves an empty status', async () => {
    const onSave = renderControl('Lunch');
    await userEvent.click(screen.getByRole('button', { name: 'status.clear' }));
    expect(onSave).toHaveBeenCalledWith('');
  });
});
