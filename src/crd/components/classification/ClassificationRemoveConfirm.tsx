import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';

export type ClassificationRemoveConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Classification's display label, interpolated into the confirmation copy. */
  displayLabel: string;
  onConfirm: () => void;
  loading?: boolean;
};

/**
 * Removal confirmation (FR-014b) — required in EVERY case, whether or not the
 * Classification currently has values selected, because removal discards the
 * whole Classification (label, snapshot vocabulary, every selected value) and
 * commits immediately with no undo and no soft-delete.
 */
export function ClassificationRemoveConfirm({
  open,
  onOpenChange,
  displayLabel,
  onConfirm,
  loading,
}: ClassificationRemoveConfirmProps) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('classifications.remove.confirmTitle')}
      description={t('classifications.remove.confirmDescription', { label: displayLabel })}
      confirmLabel={t('classifications.remove.confirmButton')}
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  );
}
