import { Globe, Trash2, Users, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type MemoCollabFooterProps = {
  connectionStatus: CollabStatus;
  memberCount: number;
  isGuest?: boolean;
  readonlyReason?: string;
  onDelete?: () => void;
  className?: string;
};

export function MemoCollabFooter({
  connectionStatus,
  memberCount,
  isGuest,
  readonlyReason,
  onDelete,
  className,
}: MemoCollabFooterProps) {
  const { t } = useTranslation('crd-space');

  const statusLabel =
    connectionStatus === 'connected'
      ? t('memo.footer.connected')
      : connectionStatus === 'connecting'
        ? t('memo.footer.connecting')
        : t('memo.footer.disconnected');

  const StatusIcon = connectionStatus === 'connected' ? Wifi : WifiOff;

  return (
    <div
      className={cn('flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2', className)}
    >
      <div className="flex items-center gap-2">
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
        {readonlyReason && <span className="text-caption text-muted-foreground">{readonlyReason}</span>}
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
