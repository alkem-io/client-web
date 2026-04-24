import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';

type DeleteFramingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Framing-to-None confirmation. Thin wrapper over `ConfirmationDialog` with
 * hard-coded copy from the `crd-space` namespace (spec FR-93, plan D6 / T043).
 */
export function DeleteFramingDialog({ open, onOpenChange, onConfirm, onCancel }: DeleteFramingDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dialogs.deleteFraming.title')}
      description={t('dialogs.deleteFraming.description')}
      confirmLabel={t('dialogs.deleteFraming.confirm')}
      cancelLabel={t('dialogs.deleteFraming.cancel')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="destructive"
    />
  );
}
