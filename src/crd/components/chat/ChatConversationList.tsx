import { EllipsisVertical, Paperclip, Pin, PinOff, Search, SquarePen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { ConversationAvatar } from './ConversationAvatar';
import { PresenceIndicator } from './PresenceIndicator';
import type { ChatListItem } from './types';

type ChatConversationListProps = {
  /** Pre-sorted: Guidance, then user-pinned, first while search is empty. */
  conversations: ChatListItem[];
  selectedConversationId?: string;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
  /** Pins or unpins a conversation; never offered for Guidance. */
  onTogglePin: (id: string) => void;
};

export function ChatConversationList({
  conversations,
  selectedConversationId,
  isLoading,
  onSelectConversation,
  onNewMessage,
  onTogglePin,
}: ChatConversationListProps) {
  const { t } = useTranslation('crd-chat');
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered =
    query.length === 0
      ? conversations
      : // During an active search pinned rows lose their position and are
        // filtered like any other — sort matches alphabetically.
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
        <ul role="list" className="min-h-0 flex-1 list-none overflow-y-auto overscroll-contain px-1 pb-2">
          {filtered.map(item => {
            const selected = item.id === selectedConversationId;
            const hasUnread = item.unreadCount > 0;
            return (
              <li
                key={item.id}
                className={cn(
                  'group/row flex items-center rounded-lg transition-colors hover:bg-accent',
                  selected && 'bg-accent'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectConversation(item.id)}
                  aria-current={selected ? 'true' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="relative flex shrink-0">
                    <ConversationAvatar
                      size="sm"
                      displayName={item.displayName}
                      avatarUrl={item.avatarUrl}
                      isGroup={item.isGroup}
                      isGuidance={item.isGuidance}
                      memberAvatars={item.memberAvatars}
                    />
                    <PresenceIndicator presence={item.presence} />
                  </span>
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
                        {item.userPinned && (
                          <Pin
                            role="img"
                            aria-label={t('list.pinned')}
                            className="size-3.5 shrink-0 text-muted-foreground"
                          />
                        )}
                      </span>
                      {item.lastMessageTimestamp && (
                        <span className="shrink-0 text-caption text-muted-foreground">{item.lastMessageTimestamp}</span>
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-caption text-muted-foreground">
                        {item.hasActiveCall ? (
                          <span className="font-medium text-success">{t('call.banner.inProgress')}</span>
                        ) : item.draftPreview ? (
                          <>
                            <span className="text-primary">{t('list.draft')}</span> {item.draftPreview}
                          </>
                        ) : item.lastMessageCall ? (
                          <span className={cn(item.lastMessageCall === 'missed' && 'text-destructive')}>
                            {t(`call.row.${item.lastMessageCall}` as 'call.row.missed')}
                          </span>
                        ) : item.lastMessagePreview?.trim() ? (
                          item.lastMessagePreview
                        ) : item.lastMessageAttachmentCount ? (
                          // Media-only last message: without this the row's
                          // preview line would just be blank.
                          <span className="inline-flex items-center gap-1">
                            <Paperclip aria-hidden="true" className="size-3 shrink-0" />
                            {t('list.attachmentPreview', { count: item.lastMessageAttachmentCount })}
                          </span>
                        ) : (
                          ''
                        )}
                      </span>
                      {hasUnread && (
                        <Badge className="h-5 min-w-5 justify-center px-1.5 text-badge">{item.unreadCount}</Badge>
                      )}
                    </span>
                  </span>
                </button>
                {item.onJoinCall && (
                  <button
                    type="button"
                    onClick={item.onJoinCall}
                    aria-label={t('call.listJoin', { name: item.displayName })}
                    className="ml-1 flex h-7 shrink-0 items-center rounded-full bg-success px-3 text-caption font-medium text-success-foreground hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {t('call.join')}
                  </button>
                )}
                {!item.isGuidance && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                      <button
                        type="button"
                        aria-label={t('list.rowOptions', { name: item.displayName })}
                        // Always shown, at a 44px target, on touch screens; revealed on hover or focus where there is a pointer.
                        className="mr-1 flex size-8 shrink-0 [@media(pointer:coarse)]:size-11 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 data-[state=open]:opacity-100"
                      >
                        <EllipsisVertical aria-hidden="true" className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[60]">
                      <DropdownMenuItem onSelect={() => onTogglePin(item.id)}>
                        {item.userPinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
                        {item.userPinned ? t('list.unpin') : t('list.pin')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
