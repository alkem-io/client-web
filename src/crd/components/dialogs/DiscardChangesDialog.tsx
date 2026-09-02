import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';

type DiscardChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Discard-on-close dialog. Thin wrapper over `ConfirmationDialog` with hard-coded
 * copy from the `crd-space` namespace (spec FR-91, plan D21).
 */
export function DiscardChangesDialog({ open, onOpenChange, onConfirm, onCancel }: DiscardChangesDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dialogs.discardChanges.title')}
      description={t('dialogs.discardChanges.description')}
      confirmLabel={t('dialogs.discardChanges.confirm')}
      cancelLabel={t('dialogs.discardChanges.cancel')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="destructive"
    />
  );
}
