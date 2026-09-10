import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemoSignedCopiesQuery, useVerifyMemoSignatureLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type MemoSignatureDocument,
  type MemoSignatureView,
  MemoSigningDialog,
} from '@/crd/components/memo/MemoSigningDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime } from '@/crd/lib/dateTimeFormat';
import { downloadMemoSignaturePdf } from './downloadMemoSignaturePdf';

type MemoSignedCopiesDialogConnectorProps = {
  open: boolean;
  memoId: string;
  onOpenChange: (open: boolean) => void;
};

export function MemoSignedCopiesDialogConnector({ open, memoId, onOpenChange }: MemoSignedCopiesDialogConnectorProps) {
  const { t, i18n } = useTranslation('crd-space');
  const notify = useNotification();
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string>();
  const history = useMemoSignedCopiesQuery({
    variables: { memoID: memoId },
    skip: !open,
    fetchPolicy: 'cache-and-network',
  });
  const [verifyMemoSignature, verification] = useVerifyMemoSignatureLazyQuery({ fetchPolicy: 'no-cache' });

  const signatures: MemoSignatureView[] = (history.data?.lookup.memo?.signatures ?? []).map(signature => ({
    ...signature,
    recordedAt: formatAbsoluteDateTime(signature.updatedDate, resolveDateFnsLocale(i18n.language)),
    verification:
      verification.variables?.attemptID === signature.id
        ? verification.loading
          ? 'checking'
          : verification.error || !verification.data
            ? 'unavailable'
            : (verification.data.verifyMemoSignature.toLowerCase() as 'verified' | 'invalid' | 'unavailable')
        : undefined,
  }));

  const handleDownload = async (document: MemoSignatureDocument) => {
    setDownloadingDocumentId(document.id);
    try {
      await downloadMemoSignaturePdf(document);
    } catch {
      notify(t('memo.signing.downloadFailed'), 'error');
    } finally {
      setDownloadingDocumentId(undefined);
    }
  };

  return (
    <MemoSigningDialog
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => onOpenChange(false)}
      mode="history"
      historyState={history.error ? 'error' : history.loading && !history.data ? 'loading' : 'ready'}
      signatures={signatures}
      onVerify={attemptID => void verifyMemoSignature({ variables: { attemptID } })}
      onDownload={document => void handleDownload(document)}
      downloadingDocumentId={downloadingDocumentId}
    />
  );
}
