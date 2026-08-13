import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
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

const renderList = (conversations: ChatListItem[]) =>
  render(
    <ChatConversationList
      conversations={conversations}
      isLoading={false}
      onSelectConversation={vi.fn()}
      onNewMessage={vi.fn()}
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
