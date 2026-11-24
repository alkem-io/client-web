import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { ChatPresence } from './types';
import { UserPresencePopover } from './UserPresencePopover';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderPopover = (props: { statusMessage?: string; presence?: ChatPresence }) =>
  render(
    <UserPresencePopover displayName="Ann Lee" {...props}>
      <span aria-hidden="true">AL</span>
    </UserPresencePopover>
  );

const card = () => document.querySelector('[data-slot="hover-card-content"]') as HTMLElement | null;

describe('UserPresencePopover', () => {
  test('the avatar is a button named by the person and their availability', () => {
    renderPopover({ presence: 'away' });
    expect(screen.getByRole('button', { name: 'Ann Lee presence.away' })).toBeInTheDocument();
  });

  test('a tap shows the status message alone: no name, no availability', async () => {
    renderPopover({ statusMessage: 'In a workshop', presence: 'online' });
    expect(card()).toBeNull();

    fireEvent.click(screen.getByRole('button'));

    await screen.findByText('In a workshop');
    expect(card()?.textContent).toBe('In a workshop');
  });

  test('a status message opens a card even when the availability is unknown', async () => {
    renderPopover({ statusMessage: 'In a workshop', presence: 'unknown' });
    // The button names the status too: a keyboard user cannot enter the hover card.
    fireEvent.click(screen.getByRole('button', { name: 'Ann Lee, In a workshop' }));
    await waitFor(() => expect(card()?.textContent).toBe('In a workshop'));
  });

  test('without a status message, hovering shows the availability', async () => {
    renderPopover({ presence: 'offline' });
    await userEvent.hover(screen.getByRole('button'));
    await waitFor(() => expect(card()?.textContent).toBe('presence.offline'));
  });

  test('the card is marked so a press on it does not dismiss a dialog under the chat', async () => {
    renderPopover({ presence: 'online' });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(card()).not.toBeNull());
    expect(card()?.closest('[data-dialog-dismiss-ignore]')).not.toBeNull();
  });

  test('with no status message and unknown presence there is nothing to open, and no dot', () => {
    renderPopover({ presence: 'unknown' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
