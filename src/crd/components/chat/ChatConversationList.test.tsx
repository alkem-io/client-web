import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import bg from '../../i18n/chat/chat.bg.json';
import de from '../../i18n/chat/chat.de.json';
import en from '../../i18n/chat/chat.en.json';
import es from '../../i18n/chat/chat.es.json';
import fr from '../../i18n/chat/chat.fr.json';
import nl from '../../i18n/chat/chat.nl.json';
import { ChatConversationList } from './ChatConversationList';
import type { ChatListItem } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const conversation = (overrides: Partial<ChatListItem>): ChatListItem => ({
  id: 'conv-1',
  displayName: 'Ada Lovelace',
  isGroup: false,
  isGuidance: false,
  unreadCount: 0,
  ...overrides,
});

const renderList = (conversations: ChatListItem[], onTogglePin = vi.fn()) =>
  render(
    <ChatConversationList
      conversations={conversations}
      isLoading={false}
      onSelectConversation={vi.fn()}
      onNewMessage={vi.fn()}
      onTogglePin={onTogglePin}
    />
  );

describe('ChatConversationList draft preview', () => {
  test('shows the last message when there is no draft', () => {
    renderList([conversation({ lastMessagePreview: 'See you tomorrow' })]);

    expect(screen.getByText('See you tomorrow')).toBeInTheDocument();
    expect(screen.queryByText('list.draft')).not.toBeInTheDocument();
  });

  test('a draft replaces the last-message preview and is labelled', () => {
    renderList([conversation({ lastMessagePreview: 'See you tomorrow', draftPreview: 'Actually, about that' })]);

    expect(screen.getByText('list.draft')).toBeInTheDocument();
    expect(screen.getByText(/Actually, about that/)).toBeInTheDocument();
    expect(screen.queryByText('See you tomorrow')).not.toBeInTheDocument();
  });

  // A media-only message has an empty body, so the preview line used to render
  // as a blank row with no indication anything had been sent.
  test('a media-only last message previews its attachments instead of a blank line', () => {
    renderList([conversation({ lastMessagePreview: '', lastMessageAttachmentCount: 2 })]);

    expect(screen.getByText('list.attachmentPreview')).toBeInTheDocument();
  });

  test('text wins over the attachment label when the last message has both', () => {
    renderList([conversation({ lastMessagePreview: 'Here you go', lastMessageAttachmentCount: 1 })]);

    expect(screen.getByText('Here you go')).toBeInTheDocument();
    expect(screen.queryByText('list.attachmentPreview')).not.toBeInTheDocument();
  });

  test('a call as the last entry previews what became of it', () => {
    renderList([conversation({ lastMessagePreview: '', lastMessageCall: 'missed' })]);

    expect(screen.getByText('call.row.missed')).toHaveClass('text-destructive');
  });

  test('a draft does not change the order of the list', () => {
    renderList([
      conversation({ id: 'conv-1', displayName: 'Ada Lovelace' }),
      conversation({ id: 'conv-2', displayName: 'Grace Hopper', draftPreview: 'unsent' }),
    ]);

    const names = screen.getAllByRole('listitem').map(item => item.textContent);
    expect(names[0]).toContain('Ada Lovelace');
    expect(names[1]).toContain('Grace Hopper');
  });
});

describe('ChatConversationList scrolling', () => {
  test('contains overscroll, so scrolling past either end of the list does not scroll the page behind', () => {
    renderList([conversation({})]);
    expect(screen.getByRole('list').className).toContain('overscroll-contain');
  });
});

describe('ChatConversationList running call', () => {
  test('a row with a running call says so in place of its preview, and offers Join', async () => {
    const onJoinCall = vi.fn();
    renderList([
      conversation({
        id: 'with-call',
        displayName: 'Team',
        isGroup: true,
        lastMessagePreview: 'See you tomorrow',
        draftPreview: 'unsent',
        hasActiveCall: true,
        onJoinCall,
      }),
      conversation({ id: 'without-call', displayName: 'Other team', isGroup: true, lastMessagePreview: 'Hi' }),
    ]);

    const [withCall, withoutCall] = screen.getAllByRole('listitem');
    expect(withCall).toHaveTextContent('call.banner.inProgress');
    expect(withCall).not.toHaveTextContent('See you tomorrow');
    expect(withCall).not.toHaveTextContent('unsent');
    expect(withoutCall).not.toHaveTextContent('call.banner.inProgress');
    expect(screen.getAllByRole('button', { name: 'call.listJoin' })).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'call.listJoin' }));
    expect(onJoinCall).toHaveBeenCalledOnce();
  });

  test.each(
    Object.entries({ en, nl, es, bg, de, fr })
  )('the Join chip name contains its visible label, so voice control finds it (%s)', (_language, chat) => {
    expect(chat.call.listJoin.toLowerCase()).toContain(chat.call.join.toLowerCase());
  });

  test('a running call with nothing to join shows no Join chip', () => {
    renderList([conversation({ hasActiveCall: true })]);
    expect(screen.getByText('call.banner.inProgress')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'call.listJoin' })).not.toBeInTheDocument();
  });
});

describe('ChatConversationList presence', () => {
  test('a 1:1 row shows the counterpart availability dot on its avatar', () => {
    renderList([conversation({ presence: 'online' })]);
    expect(screen.getByRole('img', { name: 'presence.online' })).toBeInTheDocument();
  });

  test('a row with unknown or no presence shows no dot', () => {
    renderList([conversation({ id: 'a', presence: 'unknown' }), conversation({ id: 'b' })]);
    expect(screen.queryByRole('img', { name: /presence\./ })).not.toBeInTheDocument();
  });
});

describe('ChatConversationList pin', () => {
  test('shows the pin indicator only on user-pinned rows', () => {
    renderList([
      conversation({ id: 'pinned', displayName: 'Team', userPinned: true }),
      conversation({ id: 'unpinned', displayName: 'Other team' }),
    ]);

    const indicators = screen.getAllByRole('img', { name: 'list.pinned' });
    expect(indicators).toHaveLength(1);
    expect(indicators[0].closest('li')).toHaveTextContent('Team');
    expect(indicators[0].closest('li')).not.toHaveTextContent('Other team');
  });

  test('the row menu pins an unpinned conversation', async () => {
    const onTogglePin = vi.fn();
    renderList([conversation({ id: 'conv-1' })], onTogglePin);
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    await user.click(screen.getByRole('button', { name: 'list.rowOptions' }));
    await user.click(screen.getByRole('menuitem', { name: 'list.pin' }));

    expect(onTogglePin).toHaveBeenCalledWith('conv-1');
  });

  test('the row menu is reachable from the keyboard and offers Unpin on a pinned conversation', async () => {
    const onTogglePin = vi.fn();
    renderList([conversation({ id: 'conv-1', userPinned: true })], onTogglePin);
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    act(() => screen.getByRole('button', { name: 'list.rowOptions' }).focus());
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual(['list.unpin']);
    await user.keyboard('{Enter}');

    expect(onTogglePin).toHaveBeenCalledWith('conv-1');
  });

  test('the row menu does not open the conversation', async () => {
    const onSelectConversation = vi.fn();
    render(
      <ChatConversationList
        conversations={[conversation({ id: 'conv-1' })]}
        isLoading={false}
        onSelectConversation={onSelectConversation}
        onNewMessage={vi.fn()}
        onTogglePin={vi.fn()}
      />
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    await user.click(screen.getByRole('button', { name: 'list.rowOptions' }));

    expect(onSelectConversation).not.toHaveBeenCalled();
  });

  test('Guidance has no pin action', () => {
    renderList([conversation({ id: 'guidance', isGuidance: true, pinned: true })]);

    expect(screen.queryByRole('button', { name: 'list.rowOptions' })).not.toBeInTheDocument();
  });
});
