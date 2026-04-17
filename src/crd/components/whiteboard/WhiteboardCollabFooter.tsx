import { Globe, RotateCcw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type WhiteboardCollabFooterProps = {
  canDelete?: boolean;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  readonlyMessage?: ReactNode;
  canRestart?: boolean;
  onRestart?: () => void;
  guestWarningVisible?: boolean;
  guestAccessBadge?: ReactNode;
  className?: string;
};

export function WhiteboardCollabFooter({
  canDelete,
  onDelete,
  deleteDisabled,
  readonlyMessage,
  canRestart,
  onRestart,
  guestWarningVisible,
  guestAccessBadge,
  className,
}: WhiteboardCollabFooterProps) {
  const { t } = useTranslation('crd-whiteboard');

  return (
    <div
      className={cn('flex items-center justify-between px-4 py-2 border-t border-border flex-wrap gap-2', className)}
    >
      <div className="flex items-center gap-2">
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleteDisabled}
            aria-label={t('editor.delete')}
          >
            <Trash2 className="size-4 mr-1" aria-hidden="true" />
            {t('editor.delete')}
          </Button>
        )}
        {readonlyMessage && <span className="text-caption text-muted-foreground">{readonlyMessage}</span>}
        {canRestart && (
          <Button variant="outline" size="sm" onClick={onRestart}>
            <RotateCcw className="size-3 mr-1" aria-hidden="true" />
            {t('editor.restart')}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {guestWarningVisible && (
          <div className="flex items-center gap-1 border border-destructive rounded px-2 py-1 text-destructive">
            <Globe className="size-3.5" aria-hidden="true" />
            <span className="text-caption">{t('footer.guestContributionsWarning')}</span>
          </div>
        )}
        {guestAccessBadge}
      </div>
    </div>
  );
}
