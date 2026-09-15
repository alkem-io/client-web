import { useTranslation } from 'react-i18next';
import { useMemoSignedCopiesQuery } from '@/core/apollo/generated/apollo-hooks';
import { type MemoSignatureView, MemoSigningDialog } from '@/crd/components/memo/MemoSigningDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime, formatMachineDateTime } from '@/crd/lib/dateTimeFormat';
import { useMemoSignatureActions } from './useMemoSignatureActions';

type MemoSignedCopiesDialogConnectorProps = {
  open: boolean;
  memoId: string;
  onOpenChange: (open: boolean) => void;
  overlayClassName?: string;
  contentClassName?: string;
};

export function MemoSignedCopiesDialogConnector({
  open,
  memoId,
  onOpenChange,
  overlayClassName,
  contentClassName,
}: MemoSignedCopiesDialogConnectorProps) {
  const { i18n } = useTranslation('crd-space');
  const signatureActions = useMemoSignatureActions();
  const history = useMemoSignedCopiesQuery({
    variables: { memoID: memoId },
    skip: !open,
    fetchPolicy: 'cache-and-network',
  });

  const signatures: MemoSignatureView[] = (history.data?.lookup.memo?.signatures ?? []).map(signature => ({
    ...signature,
    recordedAt:
      formatAbsoluteDateTime(signature.updatedDate, resolveDateFnsLocale(i18n.language)) ??
      formatMachineDateTime(signature.updatedDate) ??
      '—',
    verification: signatureActions.verificationFor(signature.id),
  }));

  return (
    <MemoSigningDialog
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName={overlayClassName}
      contentClassName={contentClassName}
      onClose={() => onOpenChange(false)}
      mode="history"
      historyState={history.error ? 'error' : history.loading && !history.data ? 'loading' : 'ready'}
      signatures={signatures}
      onVerify={signatureActions.verify}
      onDownload={document => void signatureActions.download(document)}
      downloadingDocumentIds={signatureActions.downloadingDocumentIds}
      verifyDisabled={signatureActions.verifyDisabled}
    />
  );
}
