import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';

type SaveFailedDialogProps = {
  open: boolean;
  /** The failed Save's message, when there is one. */
  message: string | null;
  /** Drops the unsaved changes and reloads the page — the consumer decides how. */
  onRefresh: () => void;
  onClose: () => void;
};

/**
 * Shown when a Save from the unsaved-changes bar (or the leave dialog) fails:
 * names the error and offers a refresh, since a failure usually means the page
 * holds stale data that only a reload replaces.
 */
export function SaveFailedDialog({ open, message, onRefresh, onClose }: SaveFailedDialogProps) {
  const { t } = useTranslation('crd-common');

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
      title={t('unsavedChanges.saveFailedDialog.title')}
      description={t('unsavedChanges.saveFailedDialog.description')}
      confirmLabel={t('unsavedChanges.saveFailedDialog.refresh')}
      cancelLabel={t('unsavedChanges.saveFailedDialog.close')}
      onConfirm={onRefresh}
    >
      {message && <p className="rounded-md bg-destructive/5 p-3 text-body text-destructive">{message}</p>}
    </ConfirmationDialog>
  );
}
