import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

type ApplicationSubmittedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName?: string;
  className?: string;
};

export function ApplicationSubmittedDialog({
  open,
  onOpenChange,
  communityName,
  className,
}: ApplicationSubmittedDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden', className)}>
        <DialogTitle className="shrink-0">{t('apply.submitted.title')}</DialogTitle>
        <DialogDescription className="flex-1 min-h-0 overflow-y-auto">
          {t('apply.submitted.body', { communityName: communityName ?? '' })}
        </DialogDescription>
        <DialogFooter className="shrink-0">
          <Button type="button" variant="default" onClick={() => onOpenChange(false)}>
            {t('about.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
