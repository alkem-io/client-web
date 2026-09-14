import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemoSigningAttemptQuery } from '@/core/apollo/generated/apollo-hooks';
import type { MemoSignatureView } from '@/crd/components/memo/MemoSigningDialog';
import { MemoSigningDialog, type MemoSigningStage } from '@/crd/components/memo/MemoSigningDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime, formatMachineDateTime } from '@/crd/lib/dateTimeFormat';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useMemoSignatureActions } from '@/main/crdPages/memo/useMemoSignatureActions';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useMemoSigningReturnContext } from './MemoSigningReturnContext';
import { type MemoSigningReturnRecord, takeMemoSigningReturnRecord } from './memoSigningReturnStorage';

type ReturnCapture = {
  attemptId: string;
  routeKey: string;
  cleanedRoute?: string;
};

const getSigningAttemptId = (search: string) => new URLSearchParams(search).get('signingAttemptId');

const locationWithoutCapturedAttempt = (
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  attemptId: string
) => {
  const search = new URLSearchParams(location.search);
  if (search.get('signingAttemptId') !== attemptId) return;

  search.delete('signingAttemptId');
  const query = search.toString();
  return {
    pathname: location.pathname,
    search: query ? `?${query}` : '',
    hash: location.hash,
  };
};

export function MemoSigningReturnDialogConnector() {
  const { i18n } = useTranslation('crd-space');
  const location = useLocation();
  const navigate = useNavigate();
  const {
    calloutId: resolvedCalloutId,
    loading: urlResolverLoading,
    providerPresent: urlResolverProviderPresent,
  } = useUrlResolver();
  const signatureActions = useMemoSignatureActions();
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
  const storageReadForAttempt = useRef<string | undefined>(undefined);

  const routeKey = `${location.key}:${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    const attemptId = getSigningAttemptId(location.search);
    if (attemptId) {
      if (capture?.attemptId === attemptId) return;
      const liveRoute = `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`;
      const renderedRoute = `${location.pathname}${location.search}${location.hash}`;
      if (liveRoute !== renderedRoute || getSigningAttemptId(globalThis.location.search) !== attemptId) return;
      const cleanedLocation = locationWithoutCapturedAttempt(location, attemptId);
      if (!cleanedLocation) return;
      setRestoreIntent(current => (current?.attemptId !== attemptId ? undefined : current));
      setRestoreResolution(current => (current?.attemptId !== attemptId ? undefined : current));
      setRouteSettlement(undefined);
      setRouteSettlementRequest({ attemptId });
      setCapture({
        attemptId,
        routeKey,
        cleanedRoute: `${cleanedLocation.pathname}${cleanedLocation.search}${cleanedLocation.hash}`,
      });
      setQueryAttemptId(undefined);
      setReturnRecord(undefined);
      setDismissedAttemptId(undefined);
      setRestoreExpectedAttemptId(undefined);
      setRestoreReadyAttemptId(undefined);
      storageReadForAttempt.current = undefined;
      navigate(cleanedLocation, { replace: true, state: location.state });
      return;
    }

    if (capture?.cleanedRoute && capture.cleanedRoute === `${location.pathname}${location.search}${location.hash}`) {
      if (capture.routeKey !== routeKey) {
        setCapture({ ...capture, routeKey, cleanedRoute: undefined });
      }
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
    location.hash,
    location.pathname,
    location.state,
    navigate,
    routeKey,
    setRestoreIntent,
    setRestoreResolution,
    setRouteSettlement,
    setRouteSettlementRequest,
  ]);

  useEffect(() => {
    if (
      !capture ||
      (urlResolverProviderPresent && (urlResolverLoading || resolvedCalloutId)) ||
      routeSettlement?.attemptId === capture.attemptId
    ) {
      return;
    }
    setRouteSettlement({ attemptId: capture.attemptId });
  }, [capture, resolvedCalloutId, routeSettlement, setRouteSettlement, urlResolverLoading, urlResolverProviderPresent]);

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
          recordedAt:
            formatAbsoluteDateTime(returnedAttempt.updatedDate, resolveDateFnsLocale(i18n.language)) ??
            formatMachineDateTime(returnedAttempt.updatedDate) ??
            '—',
          verification: signatureActions.verificationFor(returnedAttempt.id),
        }
      : undefined;

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
      onVerify={signatureActions.verify}
      onDownload={document => void signatureActions.download(document)}
      downloadingDocumentIds={signatureActions.downloadingDocumentIds}
      verifyDisabled={signatureActions.verifyDisabled}
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
