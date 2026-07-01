import {
  AlertCircle,
  Check,
  CircleDashed,
  CloudOff,
  Globe,
  RefreshCw,
  RotateCcw,
  Trash2,
  Unplug,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import type { DisconnectCause } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraPostMessage';

export type CollaboraSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export type CollaboraReadonlyReason = 'connecting' | 'unauthenticated' | 'contentUpdatePolicy' | 'noMembership' | null;

/** Why recovery is impossible: the document is gone (deleted/moved) or access was revoked. */
export type CollaboraTerminalReason = 'notFound' | 'forbidden' | null;

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
  /** True once the editing session has dropped — replaces the save chip with a disconnect banner. */
  disconnected?: boolean;
  /** Why the session dropped; drives a cause-specific hint. */
  disconnectCause?: DisconnectCause | null;
  /** True when the disconnected session could have unsaved edits — shows the loss warning (FR-012). */
  changesAtRisk?: boolean;
  /** True when recovery is impossible (document gone / access revoked) — no retry offered (FR-013). */
  terminal?: boolean;
  /** Which terminal condition, for the right message. */
  terminalReason?: CollaboraTerminalReason;
  /** Invoked when the user chooses in-place reconnect (primary recovery). */
  onReconnect?: () => void;
  /** Invoked when the user chooses the full-page reload fallback. */
  onReload?: () => void;
};

export function CollaboraCollabFooter({
  saveStatus,
  memberCount = 0,
  connectedUsers = [],
  isGuest,
  readonlyReason,
  onDelete,
  className,
  disconnected = false,
  disconnectCause = null,
  changesAtRisk = false,
  terminal = false,
  terminalReason = null,
  onReconnect,
  onReload,
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

  // Disconnect detection lives upstream in `useCollaboraConnectionMonitor` (browser
  // online/offline + token-expiry timer), because Collabora's own transport signal is
  // unreliable — a pulled cable keeps the iframe reporting "connected". When disconnected we
  // replace the save chip (never leave it implying "saved" — FR-002) with an honest banner.
  const disconnectPrimary = changesAtRisk
    ? t('collabora.footer.disconnect.atRisk')
    : t('collabora.footer.disconnect.status');
  const disconnectCauseText = disconnectCause
    ? t(`collabora.footer.disconnect.cause.${disconnectCause}` as 'collabora.footer.disconnect.cause.network')
    : undefined;
  const terminalText = terminalReason
    ? t(`collabora.footer.disconnect.terminal.${terminalReason}` as 'collabora.footer.disconnect.terminal.notFound')
    : t('collabora.footer.disconnect.terminal.generic');

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
        {disconnected && !terminal && disconnectCauseText && (
          <span className="text-caption text-muted-foreground">{disconnectCauseText}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Recovery actions — user-initiated (never automatic), shown only for a recoverable
            disconnect. A terminal session (document gone / access revoked) offers no retry. */}
        {disconnected && !terminal && (onReconnect || onReload) && (
          <div className="flex items-center gap-2">
            {onReconnect && (
              <Button size="sm" variant="outline" onClick={onReconnect}>
                <RotateCcw className="size-4 mr-1" aria-hidden="true" />
                {t('collabora.footer.disconnect.reconnect')}
              </Button>
            )}
            {onReload && (
              <Button size="sm" variant="ghost" onClick={onReload}>
                <RefreshCw className="size-4 mr-1" aria-hidden="true" />
                {t('collabora.footer.disconnect.reload')}
              </Button>
            )}
          </div>
        )}
        {terminal ? (
          <output aria-live="assertive" className="flex items-center gap-1 text-caption text-destructive">
            <Unplug className="size-3.5" aria-hidden="true" />
            <span>{terminalText}</span>
          </output>
        ) : disconnected ? (
          // <output> carries an implicit role="status"; aria-live is raised to assertive when
          // the user's work is at risk so the drop is announced promptly (FR-015).
          <output
            aria-live={changesAtRisk ? 'assertive' : 'polite'}
            className={cn(
              'flex items-center gap-1 text-caption',
              changesAtRisk ? 'text-destructive' : 'text-foreground'
            )}
          >
            <Unplug className="size-3.5" aria-hidden="true" />
            <span>{disconnectPrimary}</span>
          </output>
        ) : (
          <div className={cn('flex items-center gap-1 text-caption', saveToneClass)}>
            <SaveIcon className={cn('size-3.5', saveStatus === 'saving' && 'animate-spin')} aria-hidden="true" />
            <span>{saveLabel}</span>
          </div>
        )}
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
