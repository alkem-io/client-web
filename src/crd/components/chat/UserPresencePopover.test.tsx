import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { ChatPresence } from './types';
import { UserPresencePopover } from './UserPresencePopover';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderPopover = (props: { tagline?: string; presence?: ChatPresence }) =>
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

  test('a tap opens the card with name, tagline and availability', async () => {
    renderPopover({ tagline: 'Builds bridges', presence: 'online' });
    expect(card()).toBeNull();

    fireEvent.click(screen.getByRole('button'));

    const content = await screen.findByText('Builds bridges');
    expect(card()).toContainElement(content);
    expect(card()).toHaveTextContent('Ann Lee');
    expect(card()).toHaveTextContent('presence.online');
  });

  test('the card is marked so a press on it does not dismiss a dialog under the chat', async () => {
    renderPopover({ presence: 'online' });
    fireEvent.click(screen.getByRole('button'));
    await screen.findByText('presence.online', { selector: 'p' });
    expect(card()?.closest('[data-dialog-dismiss-ignore]')).not.toBeNull();
  });

  test('hovering opens the card', async () => {
    renderPopover({ presence: 'offline' });
    await userEvent.hover(screen.getByRole('button'));
    await screen.findByText('presence.offline', { selector: 'p' });
    expect(card()).toHaveTextContent('Ann Lee');
  });

  test('with no tagline and unknown presence the card shows only the name, and there is no dot', async () => {
    renderPopover({ presence: 'unknown' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ann Lee' }));

    await screen.findByText('Ann Lee', { selector: 'p' });
    expect(card()?.textContent).toBe('Ann Lee');
  });
});
