import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CallOverlay } from './CallOverlay';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const baseProps = { label: 'Call', closeLabel: 'Close call' };

describe('CallOverlay', () => {
  test('renders the call UI inside a named dialog while open', () => {
    render(
      <CallOverlay {...baseProps} open={true} onRequestClose={vi.fn()}>
        <p>call ui</p>
      </CallOverlay>
    );
    expect(screen.getByRole('dialog', { name: 'Call' })).toBeInTheDocument();
    expect(screen.getByText('call ui')).toBeInTheDocument();
  });

  test('renders nothing while closed', () => {
    render(
      <CallOverlay {...baseProps} open={false} onRequestClose={vi.fn()}>
        <p>call ui</p>
      </CallOverlay>
    );
    expect(screen.queryByText('call ui')).not.toBeInTheDocument();
  });

  test('the close button and Escape ask the consumer to close', async () => {
    const onRequestClose = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <CallOverlay {...baseProps} open={true} onRequestClose={onRequestClose}>
        <p>call ui</p>
      </CallOverlay>
    );
    await user.click(screen.getByRole('button', { name: 'Close call' }));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onRequestClose).toHaveBeenCalledTimes(2);
  });

  const renderWithConfirm = () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const props = { title: 'Leave call?', description: 'You will leave the call.', confirmLabel: 'Leave call' };
    const ui = (confirmOpen: boolean) => (
      <CallOverlay
        {...baseProps}
        open={true}
        onRequestClose={vi.fn()}
        confirm={{ ...props, cancelLabel: 'Stay in call', open: confirmOpen, onConfirm, onCancel }}
      >
        <p>call ui</p>
      </CallOverlay>
    );
    const { rerender } = render(ui(false));
    // The confirmation opens on top of an overlay that is already showing, as it does in use.
    rerender(ui(true));
    return { onConfirm, onCancel, user: userEvent.setup({ pointerEventsCheck: 0 }) };
  };

  test('shows the leave confirmation when asked and reports the choice', async () => {
    const { onConfirm, user } = renderWithConfirm();
    expect(screen.getByRole('alertdialog', { name: 'Leave call?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Leave call' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('cancelling the confirmation keeps the call', async () => {
    const { onConfirm, onCancel, user } = renderWithConfirm();
    await user.click(screen.getByRole('button', { name: 'Stay in call' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('call ui')).toBeInTheDocument();
  });
});
