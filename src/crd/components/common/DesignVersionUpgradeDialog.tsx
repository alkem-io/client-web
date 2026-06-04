import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

type DesignVersionUpgradeDialogProps = {
  open: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function DesignVersionUpgradeDialog({
  open,
  isPending = false,
  onConfirm,
  onDismiss,
}: DesignVersionUpgradeDialogProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onDismiss()}>
      <DialogContent
        className="crd-root max-h-[90vh] flex flex-col overflow-hidden"
        closeLabel={t('header.designVersionUpgrade.closeLabel')}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-section-title">{t('header.designVersionUpgrade.title')}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="whitespace-pre-line pt-2 flex-1 min-h-0 overflow-y-auto">
          {t('header.designVersionUpgrade.body')}
        </DialogDescription>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onDismiss} disabled={isPending}>
            {t('header.designVersionUpgrade.dismiss')}
          </Button>
          <Button onClick={onConfirm} disabled={isPending} aria-busy={isPending}>
            {t('header.designVersionUpgrade.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
