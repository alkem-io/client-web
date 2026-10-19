import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notificationsDispatch = vi.fn();
let notifications: Array<{ id: string; severity: string; message: string; numericCode?: number }> = [];

vi.mock('@/core/state/useGlobalState', () => ({
  useGlobalState: () => ({ notifications, notificationsDispatch }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { toast } from 'sonner';
import { CLEAR_NOTIFICATION } from '@/core/state/global/notifications/useNotifications';
import { CrdNotificationHandler } from './CrdNotificationHandler';

describe('CrdNotificationHandler', () => {
  beforeEach(() => {
    notificationsDispatch.mockClear();
    notifications = [];
  });

  afterEach(() => {
    toast.dismiss();
  });

  it('gives every toast a close button labelled for screen readers', async () => {
    notifications = [{ id: 'n-label', severity: 'error', message: 'A connection problem occurred' }];

    render(<CrdNotificationHandler />);

    expect(await screen.findByRole('button', { name: 'notification.close' })).toBeInTheDocument();
  });

  it('clears the notification from global state when the close button is used', async () => {
    notifications = [{ id: 'n-dismiss', severity: 'error', message: 'A connection problem occurred' }];

    render(<CrdNotificationHandler />);
    // fireEvent rather than userEvent: sonner's swipe handler calls setPointerCapture on
    // pointerdown, which jsdom does not implement. The close button's own handler is a plain
    // onClick, so a click event exercises exactly the path under test.
    fireEvent.click(await screen.findByRole('button', { name: 'notification.close' }));

    expect(notificationsDispatch).toHaveBeenCalledWith({
      type: CLEAR_NOTIFICATION,
      payload: { id: 'n-dismiss' },
    });
  });

  it('positions the close button at the top right rather than sonner default top left', async () => {
    notifications = [{ id: 'n-corner', severity: 'info', message: 'Saved' }];

    const { container } = render(<CrdNotificationHandler />);
    await screen.findByRole('button', { name: 'notification.close' });

    // sonner reads these three variables off the toaster element to place the button; its LTR
    // defaults are start:0 / end:unset (top left). Asserting the element the stylesheet actually
    // resolves against is as far as jsdom can go — jsdom does not lay the toast out.
    const toaster = container.querySelector<HTMLElement>('[data-sonner-toaster]');
    expect(toaster?.style.getPropertyValue('--toast-close-button-start')).toBe('unset');
    expect(toaster?.style.getPropertyValue('--toast-close-button-end')).toBe('0');
    expect(toaster?.style.getPropertyValue('--toast-close-button-transform')).toBe('translate(35%, -35%)');
  });
});
