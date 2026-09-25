import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVerifyMemoSignatureLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { MemoSignatureDocument, MemoSignatureView } from '@/crd/components/memo/MemoSigningDialog';
import { downloadMemoSignaturePdf } from './downloadMemoSignaturePdf';

export function useMemoSignatureActions() {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const [downloadingDocumentIds, setDownloadingDocumentIds] = useState<ReadonlySet<string>>(() => new Set());
  const [verifyMemoSignature, verification] = useVerifyMemoSignatureLazyQuery({ fetchPolicy: 'no-cache' });

  const verificationFor = (attemptId: string): MemoSignatureView['verification'] =>
    verification.variables?.attemptID === attemptId
      ? verification.loading
        ? 'checking'
        : verification.error || !verification.data
          ? 'unavailable'
          : (verification.data.verifyMemoSignature.toLowerCase() as 'verified' | 'invalid' | 'unavailable')
      : undefined;

  const verify = (attemptId: string) => {
    void verifyMemoSignature({ variables: { attemptID: attemptId } });
  };

  const download = async (document: MemoSignatureDocument) => {
    setDownloadingDocumentIds(current => new Set(current).add(document.id));
    try {
      await downloadMemoSignaturePdf(document);
    } catch {
      notify(t('memo.signing.downloadFailed'), 'error');
    } finally {
      setDownloadingDocumentIds(current => {
        const next = new Set(current);
        next.delete(document.id);
        return next;
      });
    }
  };

  return {
    verificationFor,
    verify,
    download,
    downloadingDocumentIds,
    verifyDisabled: verification.loading,
  };
}
