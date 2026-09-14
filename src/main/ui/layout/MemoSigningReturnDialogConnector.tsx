import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useMemoSigningAttemptQuery, useVerifyMemoSignatureLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { MemoSignatureDocument, MemoSignatureView } from '@/crd/components/memo/MemoSigningDialog';
import { MemoSigningDialog, type MemoSigningStage } from '@/crd/components/memo/MemoSigningDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime } from '@/crd/lib/dateTimeFormat';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { downloadMemoSignaturePdf } from '@/main/crdPages/memo/downloadMemoSignaturePdf';
import { useMemoSigningReturnContext } from './MemoSigningReturnContext';
import { type MemoSigningReturnRecord, takeMemoSigningReturnRecord } from './memoSigningReturnStorage';

type ReturnCapture = {
  attemptId: string;
  routeKey: string;
};

const getSigningAttemptId = (search: string) => new URLSearchParams(search).get('signingAttemptId');

const stripCapturedAttempt = (attemptId: string) => {
  const search = new URLSearchParams(globalThis.location.search);
  if (search.get('signingAttemptId') !== attemptId) return;

  search.delete('signingAttemptId');
  const query = search.toString();
  globalThis.history.replaceState(
    globalThis.history.state,
    '',
    `${globalThis.location.pathname}${query ? `?${query}` : ''}${globalThis.location.hash}`
  );
};

export function MemoSigningReturnDialogConnector() {
  const { t, i18n } = useTranslation('crd-space');
  const location = useLocation();
  const notify = useNotification();
  const { loading: currentUserLoading, userModel } = useCurrentUserContext();
  const {
    restoreResolution,
    setRestoreIntent,
    setRestoreResolution,
    routeSettlement,
    setRouteSettlementRequest,
    setRouteSettlement,
  } = useMemoSigningReturnContext();
  const [capture, setCapture] = useState<ReturnCapture>();
  const [queryAttemptId, setQueryAttemptId] = useState<string>();
  const [returnRecord, setReturnRecord] = useState<MemoSigningReturnRecord>();
  const [dismissedAttemptId, setDismissedAttemptId] = useState<string>();
  const [restoreExpectedAttemptId, setRestoreExpectedAttemptId] = useState<string>();
  const [restoreReadyAttemptId, setRestoreReadyAttemptId] = useState<string>();
  const [downloadingDocumentIds, setDownloadingDocumentIds] = useState<ReadonlySet<string>>(() => new Set());
  const storageReadForAttempt = useRef<string | undefined>(undefined);

  const routeKey = `${location.key}:${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    const attemptId = getSigningAttemptId(location.search);
    if (attemptId) {
      if (capture?.attemptId === attemptId) return;
      setRestoreIntent(current => (current?.attemptId !== attemptId ? undefined : current));
      setRestoreResolution(current => (current?.attemptId !== attemptId ? undefined : current));
      setRouteSettlement(undefined);
      setRouteSettlementRequest({ attemptId });
      setCapture({ attemptId, routeKey });
      setQueryAttemptId(undefined);
      setReturnRecord(undefined);
      setDismissedAttemptId(undefined);
      setRestoreExpectedAttemptId(undefined);
      setRestoreReadyAttemptId(undefined);
      storageReadForAttempt.current = undefined;
      stripCapturedAttempt(attemptId);
      return;
    }

    if (capture && capture.routeKey !== routeKey) {
      setRestoreIntent(current => (current?.attemptId === capture.attemptId ? undefined : current));
      setRestoreResolution(current => (current?.attemptId === capture.attemptId ? undefined : current));
      setRouteSettlement(current => (current?.attemptId === capture.attemptId ? undefined : current));
      setRouteSettlementRequest(current => (current?.attemptId === capture.attemptId ? undefined : current));
      setCapture(undefined);
      setQueryAttemptId(undefined);
      setReturnRecord(undefined);
      setRestoreExpectedAttemptId(undefined);
      setRestoreReadyAttemptId(undefined);
    }
  }, [
    capture,
    location.search,
    routeKey,
    setRestoreIntent,
    setRestoreResolution,
    setRouteSettlement,
    setRouteSettlementRequest,
  ]);

  useEffect(() => {
    if (
      !capture ||
      currentUserLoading ||
      !userModel ||
      routeSettlement?.attemptId !== capture.attemptId ||
      storageReadForAttempt.current === capture.attemptId
    ) {
      return;
    }

    storageReadForAttempt.current = capture.attemptId;
    const stored = takeMemoSigningReturnRecord(capture.attemptId);
    setReturnRecord(stored?.userId === userModel.id ? stored : undefined);
    setQueryAttemptId(capture.attemptId);
  }, [capture, currentUserLoading, routeSettlement, userModel]);

  const returnAttempt = useMemoSigningAttemptQuery({
    variables: { attemptID: queryAttemptId ?? '' },
    skip: !queryAttemptId,
    fetchPolicy: 'network-only',
  });
  const [verifyMemoSignature, verification] = useVerifyMemoSignatureLazyQuery({ fetchPolicy: 'no-cache' });

  const returnedAttempt = returnAttempt.data?.signingAttempt;
  const returnedAttemptMatches = Boolean(queryAttemptId && returnedAttempt?.id === queryAttemptId);
  const returnedStatus = returnedAttemptMatches && returnedAttempt ? returnedAttempt.status.toLowerCase() : undefined;
  const isSignedWithDocument = returnedStatus === 'signed' && Boolean(returnedAttempt?.document);

  useEffect(() => {
    if (!capture || !returnedAttemptMatches || !returnRecord) return;

    setRestoreExpectedAttemptId(capture.attemptId);
    setRestoreResolution(current => (current?.attemptId === capture.attemptId ? current : undefined));
    setRestoreIntent({
      attemptId: capture.attemptId,
      calloutId: returnRecord.calloutId,
      memoId: returnRecord.memoId,
      kind: returnRecord.kind,
      contributionId: returnRecord.contributionId,
      refreshMemo: isSignedWithDocument,
    });
    setReturnRecord(undefined);
  }, [capture, isSignedWithDocument, returnRecord, returnedAttemptMatches, setRestoreIntent, setRestoreResolution]);

  const signingStage: MemoSigningStage | undefined = queryAttemptId
    ? returnAttempt.loading
      ? 'checking'
      : returnAttempt.error
        ? returnAttempt.error.networkError
          ? 'return-error'
          : undefined
        : returnAttempt.data?.signingAttempt && !returnedAttemptMatches
          ? undefined
          : !returnAttempt.data?.signingAttempt
            ? 'return-error'
            : returnedStatus === 'signed' && !returnedAttempt?.document
              ? 'return-error'
              : (returnedStatus as MemoSigningStage)
    : undefined;

  const completedSignature: MemoSignatureView | undefined =
    isSignedWithDocument && returnedAttempt?.document
      ? {
          id: returnedAttempt.id,
          document: returnedAttempt.document,
          actor: returnedAttempt.actor,
          updatedDate: returnedAttempt.updatedDate,
          recordedAt: formatAbsoluteDateTime(returnedAttempt.updatedDate, resolveDateFnsLocale(i18n.language)),
          verification:
            verification.variables?.attemptID === returnedAttempt.id
              ? verification.loading
                ? 'checking'
                : verification.error || !verification.data
                  ? 'unavailable'
                  : (verification.data.verifyMemoSignature.toLowerCase() as 'verified' | 'invalid' | 'unavailable')
              : undefined,
        }
      : undefined;

  const handleDownload = async (document: MemoSignatureDocument) => {
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

  const close = () => {
    if (!queryAttemptId) return;
    setDismissedAttemptId(queryAttemptId);
  };

  useEffect(() => {
    if (
      !dismissedAttemptId ||
      restoreResolution?.attemptId !== dismissedAttemptId ||
      !restoreResolution.focusTarget?.isConnected
    ) {
      return;
    }
    restoreResolution.focusTarget.focus();
  }, [dismissedAttemptId, restoreResolution]);

  useEffect(() => {
    if (
      !queryAttemptId ||
      restoreExpectedAttemptId !== queryAttemptId ||
      restoreResolution?.attemptId !== queryAttemptId
    ) {
      return;
    }
    setRestoreReadyAttemptId(queryAttemptId);
  }, [queryAttemptId, restoreExpectedAttemptId, restoreResolution]);

  const waitingForRestore = Boolean(
    queryAttemptId &&
      ((returnRecord?.attemptId === queryAttemptId && (returnAttempt.loading || returnedAttemptMatches)) ||
        (restoreExpectedAttemptId === queryAttemptId && restoreReadyAttemptId !== queryAttemptId))
  );
  const open = Boolean(signingStage && queryAttemptId !== dismissedAttemptId && !waitingForRestore);
  if (!signingStage) return null;

  return (
    <MemoSigningDialog
      open={open}
      onOpenChange={nextOpen => !nextOpen && close()}
      mode="signing"
      stage={signingStage}
      completedSignature={completedSignature}
      onContinue={() => undefined}
      onVerify={attemptID => void verifyMemoSignature({ variables: { attemptID } })}
      onDownload={document => void handleDownload(document)}
      downloadingDocumentIds={downloadingDocumentIds}
      verifyDisabled={verification.loading}
      onClose={close}
      onCloseAutoFocus={event => {
        const focusTarget =
          restoreResolution && restoreResolution.attemptId === queryAttemptId
            ? restoreResolution.focusTarget
            : undefined;
        if (!focusTarget?.isConnected) return;
        event.preventDefault();
        focusTarget.focus();
      }}
    />
  );
}
