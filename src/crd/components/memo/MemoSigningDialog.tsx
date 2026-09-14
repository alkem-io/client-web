import {
  BadgeCheck,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Fingerprint,
  Loader2,
  PenLine,
  ShieldCheck,
  SquareArrowOutUpRight,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMachineDateTime } from '@/crd/lib/dateTimeFormat';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

export type MemoSigningStage =
  | 'idle'
  | 'preparing'
  | 'preview'
  | 'continuing'
  | 'checking'
  | 'pending'
  | 'signed'
  | 'cancelled'
  | 'failed'
  | 'expired'
  | 'prepare-error'
  | 'continue-error'
  | 'return-error';

export type MemoSignatureDocument = {
  id: string;
  url: string;
  displayName?: string | null;
};

export type MemoSignatureView = {
  id: string;
  document?: MemoSignatureDocument | null;
  actor?: { profile?: { displayName: string; url: string } | null } | null;
  updatedDate: string | Date;
  recordedAt: string;
  verification?: 'checking' | 'verified' | 'invalid' | 'unavailable';
};

type CommonProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  overlayClassName?: string;
  contentClassName?: string;
  onCloseAutoFocus?: ComponentProps<typeof DialogContent>['onCloseAutoFocus'];
};

type HistoryProps = CommonProps & {
  mode: 'history';
  historyState: 'loading' | 'error' | 'ready';
  signatures: MemoSignatureView[];
  onVerify: (attemptId: string) => void;
  onDownload: (document: MemoSignatureDocument) => void;
  downloadingDocumentIds?: ReadonlySet<string>;
  verifyDisabled?: boolean;
};

type SigningProps = CommonProps & {
  mode: 'signing';
  stage: MemoSigningStage;
  previewUrl?: string;
  completedSignature?: MemoSignatureView;
  onContinue: () => void;
  onVerify?: (attemptId: string) => void;
  onDownload?: (document: MemoSignatureDocument) => void;
  downloadingDocumentIds?: ReadonlySet<string>;
  verifyDisabled?: boolean;
};

export type MemoSigningDialogProps = HistoryProps | SigningProps;

type SignedCopyProps = {
  signature: MemoSignatureView;
  onVerify?: (attemptId: string) => void;
  onDownload?: (document: MemoSignatureDocument) => void;
  downloadingDocumentIds?: ReadonlySet<string>;
  verifyDisabled?: boolean;
};

function VerificationResult({ value }: { value: NonNullable<MemoSignatureView['verification']> }) {
  const { t } = useTranslation('crd-space');
  const checking = value === 'checking';
  const Icon = checking ? Loader2 : value === 'verified' ? ShieldCheck : FileCheck2;

  return (
    <output
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-caption',
        value === 'verified' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
        value === 'invalid' && 'bg-destructive/10 text-destructive',
        (checking || value === 'unavailable') && 'bg-muted text-muted-foreground'
      )}
    >
      <Icon aria-hidden="true" className={cn('size-3.5', checking && 'animate-spin motion-reduce:animate-none')} />
      {t(`memo.signing.verification.${value}` as const)}
    </output>
  );
}

function SignedCopy({ signature, onVerify, onDownload, downloadingDocumentIds, verifyDisabled }: SignedCopyProps) {
  const { t } = useTranslation('crd-space');
  const document = signature.document;
  if (!document) return null;

  const downloading = downloadingDocumentIds?.has(document.id) === true;
  const signerName = signature.actor?.profile?.displayName;
  const signerInitial = signerName?.trim().charAt(0).toUpperCase() || '?';
  const machineDateTime = formatMachineDateTime(signature.updatedDate);
  const recordedAt = signature.recordedAt.trim() || machineDateTime;

  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
          <FileText aria-hidden="true" className="size-6" />
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-badge text-primary-foreground ring-2 ring-card">
            {signerInitial}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5">
          {signerName && signature.actor?.profile?.url ? (
            <a
              className="block truncate text-body-emphasis text-primary underline underline-offset-2"
              href={signature.actor.profile.url}
            >
              {signerName}
            </a>
          ) : (
            <p className="truncate text-body-emphasis">{signerName || t('memo.signing.unknownSigner')}</p>
          )}
          <p className="text-caption text-muted-foreground">
            {t('memo.signing.recorded')}: <time dateTime={machineDateTime}>{recordedAt}</time>
          </p>
          {signature.verification && <VerificationResult value={signature.verification} />}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
        <Button asChild={true} size="sm">
          <a href={document.url} target="_blank" rel="noreferrer">
            {t('memo.signing.openSignedPdf')}
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={downloading}
          aria-busy={downloading}
          onClick={() => onDownload?.(document)}
        >
          <Download aria-hidden="true" />
          {t('memo.signing.download')}
        </Button>
        {onVerify && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={verifyDisabled || signature.verification === 'checking'}
            aria-busy={signature.verification === 'checking'}
            onClick={() => onVerify(signature.id)}
          >
            <ShieldCheck aria-hidden="true" />
            {t('memo.signing.verify')}
          </Button>
        )}
      </div>
    </li>
  );
}

function SigningJourney() {
  const { t } = useTranslation('crd-space');
  const steps = [
    { icon: SquareArrowOutUpRight, key: 'provider' },
    { icon: Fingerprint, key: 'identity' },
    { icon: FileCheck2, key: 'return' },
  ] as const;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 border-t bg-muted/25 p-5 lg:w-80 lg:border-l lg:border-t-0">
      <div>
        <p className="text-label uppercase text-muted-foreground">{t('memo.signing.whatHappensNext')}</p>
        <ol className="mt-4 space-y-4">
          {steps.map(step => (
            <li key={step.key} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-body-emphasis">{t(`memo.signing.steps.${step.key}.title` as const)}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {t(`memo.signing.steps.${step.key}.description` as const)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <PenLine aria-hidden="true" className="size-4 text-muted-foreground" />
          <p className="text-body-emphasis">{t('memo.signing.editableTitle')}</p>
        </div>
        <p className="mt-1.5 text-caption text-muted-foreground">{t('memo.signing.editableDescription')}</p>
      </div>
    </aside>
  );
}

function SuccessHeader() {
  const { t } = useTranslation('crd-space');

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-background px-6 pb-6 pt-9 text-center dark:from-emerald-500/10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-primary/5 blur-3xl" />
      <div
        data-testid="memo-signing-success-mark"
        className="relative mx-auto flex size-20 animate-in items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg duration-500 zoom-in-50 motion-reduce:animate-none"
      >
        <BadgeCheck aria-hidden="true" className="size-10" />
      </div>
      <DialogTitle className="relative mt-4 text-page-title">{t('memo.signing.savedTitle')}</DialogTitle>
      <DialogDescription className="relative mx-auto mt-1.5 max-w-md">
        {t('memo.signing.snapshotExplanation')}
      </DialogDescription>
    </div>
  );
}

export function MemoSigningDialog(props: MemoSigningDialogProps) {
  const { t } = useTranslation('crd-space');

  if (props.mode === 'history') {
    const signatures = props.signatures.filter(signature => signature.document);
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent
          onCloseAutoFocus={props.onCloseAutoFocus}
          overlayClassName={props.overlayClassName ?? 'z-[70]'}
          className={cn(
            'flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
            props.contentClassName ?? 'z-[70]'
          )}
          closeLabel={t('memo.close')}
        >
          <div className="flex shrink-0 items-start gap-4 border-b px-6 py-5 pr-14">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <DialogHeader className="min-w-0 flex-1">
              <DialogTitle>{t('memo.signing.signedCopies')}</DialogTitle>
              <DialogDescription>{t('memo.signing.historyDescription')}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {props.historyState === 'loading' && (
              <output className="flex items-center gap-2 text-body">
                <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                {t('memo.signing.historyLoading')}
              </output>
            )}
            {props.historyState === 'error' && (
              <p role="alert" className="text-body">
                {t('memo.signing.historyError')}
              </p>
            )}
            {props.historyState === 'ready' && signatures.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-7" />
                </span>
                <p className="text-subheader">{t('memo.signing.historyEmpty')}</p>
              </div>
            )}
            {props.historyState === 'ready' && signatures.length > 0 && (
              <section className="space-y-4">
                <p className="text-body-emphasis">{t('memo.signing.historyCount', { count: signatures.length })}</p>
                <ul className="space-y-3">
                  {signatures.map(signature => (
                    <SignedCopy
                      key={signature.id}
                      signature={signature}
                      onVerify={props.onVerify}
                      onDownload={props.onDownload}
                      downloadingDocumentIds={props.downloadingDocumentIds}
                      verifyDisabled={props.verifyDisabled}
                    />
                  ))}
                </ul>
                <p className="text-caption text-muted-foreground">{t('memo.signing.standardTools')}</p>
              </section>
            )}
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={props.onClose}>
              {t('memo.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const { stage } = props;
  const message = t(`memo.signing.stage.${stage}` as const);
  const busy = stage === 'preparing' || stage === 'continuing';
  const isPreview = stage === 'preview' || stage === 'continuing';
  const isActiveWorkflow = stage === 'idle' || stage === 'preparing' || isPreview;
  const completedSignature = stage === 'signed' ? props.completedSignature : undefined;
  const announceOutcome = !isActiveWorkflow;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onCloseAutoFocus={props.onCloseAutoFocus}
        overlayClassName={props.overlayClassName ?? 'z-[70]'}
        className={cn(
          'gap-0 overflow-hidden p-0',
          isActiveWorkflow ? 'flex h-[min(92vh,820px)] flex-col sm:max-w-6xl' : 'sm:max-w-xl',
          props.contentClassName ?? 'z-[70]'
        )}
        closeLabel={t('memo.close')}
      >
        {completedSignature?.document ? (
          <>
            <SuccessHeader />
            <div className="px-6 py-5">
              <ul>
                <SignedCopy
                  signature={completedSignature}
                  onVerify={props.onVerify}
                  onDownload={props.onDownload}
                  downloadingDocumentIds={props.downloadingDocumentIds}
                  verifyDisabled={props.verifyDisabled}
                />
              </ul>
            </div>
          </>
        ) : isActiveWorkflow ? (
          <>
            <div className="shrink-0 border-b px-6 py-5 pr-14">
              <DialogHeader>
                <DialogTitle>{t('memo.signing.title')}</DialogTitle>
                <DialogDescription>{t('memo.signing.description')}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-5">
                {busy && (
                  <output aria-label={message} className="flex items-center gap-2 text-body">
                    <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                    {message}
                  </output>
                )}
                {isPreview && props.previewUrl && (
                  <>
                    <iframe
                      title={t('memo.signing.previewTitle')}
                      src={props.previewUrl}
                      className="min-h-72 flex-1 rounded-xl border bg-muted shadow-sm"
                    />
                    <a
                      className="inline-flex w-fit items-center gap-1.5 text-body-emphasis text-primary underline underline-offset-2"
                      href={props.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('memo.signing.openPreview')}
                      <ExternalLink aria-hidden="true" className="size-4" />
                    </a>
                  </>
                )}
              </div>
              <SigningJourney />
            </div>
          </>
        ) : (
          <div className="px-6 pb-6 pt-7">
            <DialogHeader>
              <DialogTitle>{t('memo.signing.resultTitle')}</DialogTitle>
              <DialogDescription aria-live={announceOutcome ? 'polite' : undefined} aria-atomic={true}>
                {message}
                {stage === 'checking' && (
                  <Loader2 aria-hidden="true" className="ml-2 inline size-4 animate-spin motion-reduce:animate-none" />
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
        )}
        <DialogFooter className="shrink-0 flex-wrap border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={props.onClose}>
            {t('memo.close')}
          </Button>
          {isPreview && props.previewUrl && (
            <Button type="button" onClick={props.onContinue} disabled={stage === 'continuing'}>
              {stage === 'continuing' ? t('memo.signing.continuing') : t('memo.signing.continue')}
              <ExternalLink aria-hidden="true" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
