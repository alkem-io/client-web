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
      <DialogContent className="crd-root" closeLabel={t('header.designVersionUpgrade.closeLabel')}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-section-title">{t('header.designVersionUpgrade.title')}</DialogTitle>
          </div>
          <DialogDescription className="whitespace-pre-line pt-2">
            {t('header.designVersionUpgrade.body')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
