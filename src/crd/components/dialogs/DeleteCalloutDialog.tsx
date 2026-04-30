import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';

type DeleteCalloutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title of the callout, interpolated into the description for extra clarity. */
  calloutTitle: string;
  onConfirm: () => void;
  loading?: boolean;
};

/**
 * Delete-callout confirmation. Thin wrapper over `ConfirmationDialog` with
 * destructive styling + copy from the `crd-space` namespace (plan T069).
 */
export function DeleteCalloutDialog({
  open,
  onOpenChange,
  calloutTitle,
  onConfirm,
  loading,
}: DeleteCalloutDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteCallout.title')}
      description={t('deleteCallout.description', { title: calloutTitle })}
      confirmLabel={t('deleteCallout.confirm')}
      cancelLabel={t('dialogs.cancel')}
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  );
}
