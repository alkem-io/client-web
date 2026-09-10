import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  recordedAt?: string;
  verification?: 'checking' | 'verified' | 'invalid' | 'unavailable';
};

type CommonProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

type HistoryProps = CommonProps & {
  mode: 'history';
  historyState: 'loading' | 'error' | 'ready';
  signatures: MemoSignatureView[];
  onVerify: (attemptId: string) => void;
  onDownload: (document: MemoSignatureDocument) => void;
  downloadingDocumentId?: string;
};

type SigningProps = CommonProps & {
  mode: 'signing';
  stage: MemoSigningStage;
  previewUrl?: string;
  completedSignature?: MemoSignatureView;
  onContinue: () => void;
  onVerify?: (attemptId: string) => void;
  onDownload?: (document: MemoSignatureDocument) => void;
  downloadingDocumentId?: string;
};

export type MemoSigningDialogProps = HistoryProps | SigningProps;

type SignedCopyProps = {
  signature: MemoSignatureView;
  onVerify?: (attemptId: string) => void;
  onDownload?: (document: MemoSignatureDocument) => void;
  downloadingDocumentId?: string;
};

function SignedCopy({ signature, onVerify, onDownload, downloadingDocumentId }: SignedCopyProps) {
  const { t } = useTranslation('crd-space');
  const document = signature.document;
  if (!document) return null;

  const downloading = downloadingDocumentId === document.id;

  return (
    <li className="space-y-2 border-t pt-3 text-body first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {signature.actor?.profile?.url ? (
          <a className="text-primary underline" href={signature.actor.profile.url}>
            {signature.actor.profile.displayName}
          </a>
        ) : (
          <span>{signature.actor?.profile?.displayName}</span>
        )}
        <span>
          {t('memo.signing.recorded')}:{' '}
          <time dateTime={new Date(signature.updatedDate).toISOString()}>{signature.recordedAt}</time>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild={true} variant="outline" size="sm">
          <a href={document.url} target="_blank" rel="noreferrer">
            {t('memo.signing.openPdf')}
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={downloading}
          aria-busy={downloading}
          onClick={() => onDownload?.(document)}
        >
          {t('memo.signing.download')}
        </Button>
        {onVerify && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={signature.verification === 'checking'}
            aria-busy={signature.verification === 'checking'}
            onClick={() => onVerify(signature.id)}
          >
            {t('memo.signing.verify')}
          </Button>
        )}
      </div>
      {signature.verification && <output>{t(`memo.signing.verification.${signature.verification}` as const)}</output>}
    </li>
  );
}

export function MemoSigningDialog(props: MemoSigningDialogProps) {
  const { t } = useTranslation('crd-space');

  if (props.mode === 'history') {
    const signatures = props.signatures.filter(signature => signature.document);
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent overlayClassName="z-[70]" className="z-[70] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('memo.signing.signedCopies')}</DialogTitle>
            <DialogDescription>{t('memo.signing.historyDescription')}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto">
            {props.historyState === 'loading' && (
              <output className="flex items-center gap-2 text-body">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {t('memo.signing.historyLoading')}
              </output>
            )}
            {props.historyState === 'error' && <p className="text-body">{t('memo.signing.historyError')}</p>}
            {props.historyState === 'ready' && signatures.length === 0 && (
              <p className="text-body">{t('memo.signing.historyEmpty')}</p>
            )}
            {props.historyState === 'ready' && signatures.length > 0 && (
              <section className="space-y-3">
                <ul className="space-y-3">
                  {signatures.map(signature => (
                    <SignedCopy
                      key={signature.id}
                      signature={signature}
                      onVerify={props.onVerify}
                      onDownload={props.onDownload}
                      downloadingDocumentId={props.downloadingDocumentId}
                    />
                  ))}
                </ul>
                <p className="text-caption text-muted-foreground">{t('memo.signing.standardTools')}</p>
              </section>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={props.onClose}>
              {t('memo.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const { stage } = props;
  const message = t(`memo.signing.stage.${stage}` as const);
  const busy = stage === 'preparing' || stage === 'continuing' || stage === 'checking';
  const isPreview = stage === 'preview' || stage === 'continuing';
  const completedSignature = stage === 'signed' ? props.completedSignature : undefined;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent overlayClassName="z-[70]" className="z-[70] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {completedSignature?.document ? t('memo.signing.savedTitle') : t('memo.signing.title')}
          </DialogTitle>
          <DialogDescription>
            {completedSignature?.document ? t('memo.signing.snapshotExplanation') : t('memo.signing.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto">
          {completedSignature?.document ? (
            <ul>
              <SignedCopy
                signature={completedSignature}
                onVerify={props.onVerify}
                onDownload={props.onDownload}
                downloadingDocumentId={props.downloadingDocumentId}
              />
            </ul>
          ) : (
            <>
              <output aria-label={message} className="flex items-center gap-2 text-body">
                {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                {message}
              </output>
              {isPreview && props.previewUrl && (
                <div className="space-y-2">
                  <iframe
                    title={t('memo.signing.previewTitle')}
                    src={props.previewUrl}
                    className="h-[55vh] w-full border"
                  />
                  <a className="text-primary underline" href={props.previewUrl} target="_blank" rel="noreferrer">
                    {t('memo.signing.openPreview')}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex-wrap">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {completedSignature?.document ? t('memo.signing.backToMemo') : t('memo.close')}
          </Button>
          {isPreview && props.previewUrl && (
            <Button type="button" onClick={props.onContinue} disabled={stage === 'continuing'}>
              {stage === 'continuing' ? t('memo.signing.continuing') : t('memo.signing.continue')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
