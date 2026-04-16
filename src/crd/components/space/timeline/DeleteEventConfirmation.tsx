import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/crd/primitives/alert-dialog';
import { buttonVariants } from '@/crd/primitives/button';

type DeleteEventConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  /** Localised "Space" or "Subspace" — passed by the connector. */
  entityLabel: string;
  onConfirm: () => void;
  loading?: boolean;
};

/** AlertDialog wrapper for the destructive delete action (FR-028). */
export function DeleteEventConfirmation({
  open,
  onOpenChange,
  eventTitle,
  entityLabel,
  onConfirm,
  loading,
}: DeleteEventConfirmationProps) {
  const { t } = useTranslation('crd-space');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('calendar.deleteConfirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('calendar.deleteConfirm.body', { title: eventTitle, entity: entityLabel })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('calendar.deleteConfirm.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={loading}
            aria-busy={loading}
            onClick={onConfirm}
            className={cn(buttonVariants({ variant: 'destructive' }), 'inline-flex items-center justify-center gap-2')}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t('calendar.deleteConfirm.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
