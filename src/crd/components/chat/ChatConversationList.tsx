import { Bot, Search, SquarePen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Input } from '@/crd/primitives/input';
import { GroupAvatar } from './GroupAvatar';
import type { ChatListItem } from './types';

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('') || '?';

type ChatConversationListProps = {
  /** Pre-sorted: pinned (guidance) first while search is empty. */
  conversations: ChatListItem[];
  selectedConversationId?: string;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
};

export function ChatConversationList({
  conversations,
  selectedConversationId,
  isLoading,
  onSelectConversation,
  onNewMessage,
}: ChatConversationListProps) {
  const { t } = useTranslation('crd-chat');
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered =
    query.length === 0
      ? conversations
      : // During an active search the pinned guidance row loses its position and
        // is filtered like any other — sort matches alphabetically.
        conversations
          .filter(c => c.displayName.toLowerCase().includes(query))
          .slice()
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2 pt-1">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('list.searchPlaceholder')}
            aria-label={t('list.searchPlaceholder')}
            className="pl-8"
          />
        </div>
        <button
          type="button"
          onClick={onNewMessage}
          aria-label={t('list.newMessage')}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SquarePen aria-hidden="true" className="size-5" />
        </button>
      </div>

      {isLoading && conversations.length === 0 ? (
        <output
          className="flex flex-1 items-center justify-center px-4 text-caption text-muted-foreground"
          aria-label={t('list.loading')}
        >
          {t('list.loading')}
        </output>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
          <p className="text-body-emphasis text-foreground">{query ? t('list.noResults') : t('list.empty')}</p>
          {!query && <p className="text-caption text-muted-foreground">{t('list.emptyHint')}</p>}
        </div>
      ) : (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
        <ul role="list" className="min-h-0 flex-1 list-none overflow-y-auto px-1 pb-2">
          {filtered.map(item => {
            const selected = item.id === selectedConversationId;
            const hasUnread = item.unreadCount > 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectConversation(item.id)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected && 'bg-accent'
                  )}
                >
                  {item.isGuidance ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot aria-hidden="true" className="size-4" />
                    </span>
                  ) : item.isGroup && !item.avatarUrl ? (
                    // Group with no photo of its own → composite of member avatars.
                    <GroupAvatar members={item.memberAvatars ?? []} size="sm" />
                  ) : (
                    // 1:1 chat, or a group that has its own photo.
                    <Avatar className="size-8 shrink-0">
                      {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt="" />}
                      <AvatarFallback className="text-caption">{initials(item.displayName)}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={cn(
                            'truncate text-body',
                            hasUnread ? 'font-semibold text-foreground' : 'text-foreground'
                          )}
                        >
                          {item.displayName}
                        </span>
                        {item.isGuidance && (
                          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-badge">
                            {t('guidance.beta')}
                          </Badge>
                        )}
                      </span>
                      {item.lastMessageTimestamp && (
                        <span className="shrink-0 text-caption text-muted-foreground">{item.lastMessageTimestamp}</span>
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-caption text-muted-foreground">
                        {item.lastMessagePreview ?? ''}
                      </span>
                      {hasUnread && (
                        <Badge className="h-5 min-w-5 justify-center px-1.5 text-badge">{item.unreadCount}</Badge>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
