import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { MessageDialog } from './MessageDialog';

// Echo i18n keys so assertions don't depend on translated strings — this
// dialog reuses existing crd-profilePages/crd-space keys verbatim, so its own
// test only needs to prove behaviour, not copy.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const baseProps = {
  title: 'Send an email',
  notice: "Delivered to the organisation's administrators.",
  placeholder: 'Write an email…',
};

describe('MessageDialog', () => {
  test('send is disabled while the draft is empty', () => {
    render(
      <MessageDialog
        open={true}
        onOpenChange={vi.fn()}
        onSendMessage={vi.fn().mockResolvedValue(undefined)}
        {...baseProps}
      />
    );

    expect(screen.getByText('common.messagePopover.send')).toBeDisabled();
  });

  test('a resolved send clears the draft and closes the dialog', async () => {
    const onOpenChange = vi.fn();
    const onSendMessage = vi.fn().mockResolvedValue(undefined);
    render(<MessageDialog open={true} onOpenChange={onOpenChange} onSendMessage={onSendMessage} {...baseProps} />);

    await userEvent.type(screen.getByLabelText('common.messagePopover.ariaLabel'), 'Hello there');
    await userEvent.click(screen.getByText('common.messagePopover.send'));

    await waitFor(() => expect(onSendMessage).toHaveBeenCalledWith('Hello there'));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test('a rejected send keeps the dialog open with the text and shows an alert', async () => {
    const onOpenChange = vi.fn();
    const onSendMessage = vi.fn().mockRejectedValue(new Error('Delivery failed'));
    render(<MessageDialog open={true} onOpenChange={onOpenChange} onSendMessage={onSendMessage} {...baseProps} />);

    const textarea = screen.getByLabelText('common.messagePopover.ariaLabel');
    await userEvent.type(textarea, 'Hello there');
    await userEvent.click(screen.getByText('common.messagePopover.send'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Delivery failed'));
    expect(textarea).toHaveValue('Hello there');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test('Escape with unsent text shows the discard confirmation instead of closing', async () => {
    const onOpenChange = vi.fn();
    render(
      <MessageDialog
        open={true}
        onOpenChange={onOpenChange}
        onSendMessage={vi.fn().mockResolvedValue(undefined)}
        {...baseProps}
      />
    );

    await userEvent.type(screen.getByLabelText('common.messagePopover.ariaLabel'), 'Draft in progress');
    await userEvent.keyboard('{Escape}');

    expect(screen.getByText('dialogs.discardChanges.title')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('Escape when empty closes the dialog directly', async () => {
    const onOpenChange = vi.fn();
    render(
      <MessageDialog
        open={true}
        onOpenChange={onOpenChange}
        onSendMessage={vi.fn().mockResolvedValue(undefined)}
        {...baseProps}
      />
    );

    await userEvent.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText('dialogs.discardChanges.title')).not.toBeInTheDocument();
  });
});
