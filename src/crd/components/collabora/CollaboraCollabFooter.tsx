import { AlertCircle, Check, CircleDashed, CloudOff, Globe, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type CollaboraSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export type CollaboraReadonlyReason = 'connecting' | 'unauthenticated' | 'contentUpdatePolicy' | 'noMembership' | null;

export type CollaboraConnectedUser = {
  id: string;
  name: string;
  color: string;
};

const MAX_VISIBLE_AVATARS = 5;

// Debounce matches MemoCollabFooter so the readonly reason doesn't flash through transient
// states (e.g. connecting → connected) before settling.
const READONLY_REASON_DEBOUNCE_MS = 500;

type CollaboraCollabFooterProps = {
  saveStatus: CollaboraSaveStatus;
  memberCount?: number;
  connectedUsers?: CollaboraConnectedUser[];
  isGuest?: boolean;
  readonlyReason: CollaboraReadonlyReason;
  onDelete?: () => void;
  className?: string;
};

export function CollaboraCollabFooter({
  saveStatus,
  memberCount = 0,
  connectedUsers = [],
  isGuest,
  readonlyReason,
  onDelete,
  className,
}: CollaboraCollabFooterProps) {
  const { t } = useTranslation('crd-space');

  const visibleUsers = connectedUsers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = connectedUsers.length - visibleUsers.length;

  const [delayedReason, setDelayedReason] = useState<CollaboraReadonlyReason>(null);
  useEffect(() => {
    if (!readonlyReason) {
      setDelayedReason(null);
      return;
    }
    const timer = setTimeout(() => setDelayedReason(readonlyReason), READONLY_REASON_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [readonlyReason]);

  // Collabora doesn't reliably propagate transport state to the host window — pulling the
  // network cable keeps the iframe reporting "connected" — so the connection chip is
  // intentionally not rendered. `connectionStatus` still drives the readonly reason below.
  const SaveIcon =
    saveStatus === 'saved'
      ? Check
      : saveStatus === 'saving'
        ? CircleDashed
        : saveStatus === 'error'
          ? AlertCircle
          : CloudOff;
  const saveLabel = t(`collabora.footer.${saveStatus}` as 'collabora.footer.saved');
  const saveToneClass =
    saveStatus === 'error' ? 'text-destructive' : saveStatus === 'saved' ? 'text-muted-foreground' : 'text-foreground';

  const readonlyText = delayedReason
    ? t(`collabora.footer.readonlyReason.${delayedReason}` as 'collabora.footer.readonlyReason.connecting')
    : undefined;

  return (
    <div
      className={cn('flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2', className)}
    >
      <div className="flex items-center gap-3">
        {visibleUsers.length > 0 && (
          <ul aria-label={t('collabora.footer.connectedUsersLabel')} className="flex items-center gap-1 min-w-0">
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
                <Avatar
                  className="size-6"
                  aria-label={t('collabora.footer.moreConnectedUsers', { count: overflowCount })}
                >
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
            aria-label={t('collabora.footer.delete')}
          >
            <Trash2 className="size-4 mr-1" aria-hidden="true" />
            {t('collabora.footer.delete')}
          </Button>
        )}
        {readonlyText && <span className="text-caption text-muted-foreground">{readonlyText}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className={cn('flex items-center gap-1 text-caption', saveToneClass)}>
          <SaveIcon className={cn('size-3.5', saveStatus === 'saving' && 'animate-spin')} aria-hidden="true" />
          <span>{saveLabel}</span>
        </div>
        {memberCount > 0 && (
          <div className="flex items-center gap-1 text-caption text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{t('collabora.footer.membersOnline', { count: memberCount })}</span>
          </div>
        )}
        {isGuest && (
          <div className="flex items-center gap-1 border border-destructive rounded px-2 py-1 text-destructive">
            <Globe className="size-3.5" aria-hidden="true" />
            <span className="text-caption">{t('collabora.footer.guestWarning')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
