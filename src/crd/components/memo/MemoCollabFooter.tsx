import { Globe, Trash2, Users, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type ReadonlyReason =
  | 'connecting'
  | 'notSynced'
  | 'unauthenticated'
  | 'contentUpdatePolicy'
  | 'noMembership'
  | null;

/** Stable, React-key-safe identifier (e.g. Yjs awareness clientId as a string). */
export type ConnectedUser = {
  id: string;
  name: string;
  color: string;
};

/** Cap visible avatars to keep the footer compact; overflow collapses to a "+N" badge. */
const MAX_VISIBLE_AVATARS = 5;

type MemoCollabFooterProps = {
  connectionStatus: CollabStatus;
  memberCount: number;
  connectedUsers?: ConnectedUser[];
  isGuest?: boolean;
  readonlyReason: ReadonlyReason;
  onDelete?: () => void;
  className?: string;
};

// Matches the 500ms debounce in MUI MemoFooter — prevents the reason from flashing
// through transient transitions (e.g. connecting → synced).
const READONLY_REASON_DEBOUNCE_MS = 500;

export function MemoCollabFooter({
  connectionStatus,
  memberCount,
  connectedUsers = [],
  isGuest,
  readonlyReason,
  onDelete,
  className,
}: MemoCollabFooterProps) {
  const { t } = useTranslation('crd-space');

  const visibleUsers = connectedUsers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = connectedUsers.length - visibleUsers.length;

  const [delayedReason, setDelayedReason] = useState<ReadonlyReason>(null);
  useEffect(() => {
    if (!readonlyReason) {
      setDelayedReason(null);
      return;
    }
    const timer = setTimeout(() => setDelayedReason(readonlyReason), READONLY_REASON_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [readonlyReason]);

  const statusLabel =
    connectionStatus === 'connected'
      ? t('memo.footer.connected')
      : connectionStatus === 'connecting'
        ? t('memo.footer.connecting')
        : t('memo.footer.disconnected');

  const StatusIcon = connectionStatus === 'connected' ? Wifi : WifiOff;

  const readonlyText = delayedReason ? t(`memo.footer.readonlyReason.${delayedReason}` as const) : undefined;

  return (
    <div
      className={cn('flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2', className)}
    >
      <div className="flex items-center gap-3">
        {visibleUsers.length > 0 && (
          // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
          // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
          <ul role="list" aria-label={t('memo.footer.connectedUsersLabel')} className="flex items-center gap-1 min-w-0">
            {visibleUsers.map(user => {
              const initial = user.name.trim()[0]?.toUpperCase() ?? '?';
              return (
                <li key={user.id} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild={true}>
                      <Avatar className="size-6" aria-label={user.name}>
                        <AvatarFallback className="text-badge text-white" style={{ backgroundColor: user.color }}>
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{user.name}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
            {overflowCount > 0 && (
              <li className="flex items-center">
                <Avatar className="size-6" aria-label={t('memo.footer.moreConnectedUsers', { count: overflowCount })}>
                  <AvatarFallback className="text-badge bg-muted text-foreground">+{overflowCount}</AvatarFallback>
                </Avatar>
              </li>
            )}
          </ul>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={t('memo.footer.delete')}
          >
            <Trash2 className="size-4 mr-1" aria-hidden="true" />
            {t('memo.footer.delete')}
          </Button>
        )}
        {readonlyText && <span className="text-caption text-muted-foreground">{readonlyText}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-caption text-muted-foreground">
          <StatusIcon className="size-3.5" aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>
        {memberCount > 0 && (
          <div className="flex items-center gap-1 text-caption text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{t('memo.footer.membersOnline', { count: memberCount })}</span>
          </div>
        )}
        {isGuest && (
          <div className="flex items-center gap-1 border border-destructive rounded px-2 py-1 text-destructive">
            <Globe className="size-3.5" aria-hidden="true" />
            <span className="text-caption">{t('memo.footer.guestWarning')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
