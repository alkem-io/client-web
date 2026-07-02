import { useTranslation } from 'react-i18next';
import { CalloutDeletionSummary, hasDeletableContent } from '@/crd/components/dialogs/CalloutDeletionSummary';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import type { CalloutDeletionSummaryModel } from '@/crd/components/dialogs/calloutDeletionSummary.types';

type DeleteCalloutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title of the callout, interpolated into the description for extra clarity. */
  calloutTitle: string;
  /**
   * Cache-only summary of what the deletion removes (feature 114). When it
   * carries deletable content the dialog grows a content list and the confirm
   * label reflects the full scope; otherwise it stays the concise form.
   */
  content?: CalloutDeletionSummaryModel;
  onConfirm: () => void;
  loading?: boolean;
};

/**
 * Delete-callout confirmation. Thin wrapper over `ConfirmationDialog` with
 * destructive styling + copy from the `crd-space` namespace (plan T069).
 * Context-aware: the body and confirm label vary with the callout's contents.
 */
export function DeleteCalloutDialog({
  open,
  onOpenChange,
  calloutTitle,
  content,
  onConfirm,
  loading,
}: DeleteCalloutDialogProps) {
  const { t } = useTranslation('crd-space');
  const withContent = content !== undefined && hasDeletableContent(content);

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteCallout.title')}
      description={t('deleteCallout.description', { title: calloutTitle })}
      confirmLabel={t(withContent ? 'deleteCallout.confirmAll' : 'deleteCallout.confirm')}
      cancelLabel={t('dialogs.cancel')}
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    >
      {withContent ? <CalloutDeletionSummary summary={content} /> : undefined}
    </ConfirmationDialog>
  );
}
