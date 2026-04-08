import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Skeleton } from '@/crd/primitives/skeleton';

type PendingMembershipsListDialogProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  empty: boolean;
  children?: ReactNode;
  className?: string;
};

function PendingMembershipsListDialog({
  open,
  onClose,
  loading,
  empty,
  children,
  className,
}: PendingMembershipsListDialogProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        className={cn('sm:max-w-[600px] flex flex-col max-h-[85vh]', className)}
        closeLabel={t('pendingMemberships.closeDialog')}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('pendingMemberships.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          {loading && (
            <output aria-label={t('pendingMemberships.loading')} className="block space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-[72px] w-full rounded-lg" />
                <Skeleton className="h-[72px] w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[72px] w-full rounded-lg" />
              </div>
            </output>
          )}
          {!loading && empty && (
            <output className="block text-center py-8 text-sm text-muted-foreground">
              {t('pendingMemberships.empty')}
            </output>
          )}
          {!loading && !empty && <div className="space-y-4">{children}</div>}
        </div>

        <DialogFooter className="shrink-0 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            {t('pendingMemberships.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PendingMembershipsListDialog };
export type { PendingMembershipsListDialogProps };
