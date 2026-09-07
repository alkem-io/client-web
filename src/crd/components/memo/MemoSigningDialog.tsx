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

type MemoSignature = {
  id: string;
  document?: { url: string };
  actor?: { profile?: { displayName: string; url: string } };
  updatedDate: string | Date;
  recordedAt?: string;
  verification?: 'checking' | 'verified' | 'invalid' | 'unavailable';
};

export type MemoSigningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: MemoSigningStage;
  signatures: MemoSignature[];
  previewUrl?: string;
  onContinue: () => void;
  onVerify: (attemptId: string) => void;
  onClose: () => void;
};

export function MemoSigningDialog({
  open,
  onOpenChange,
  stage,
  signatures,
  previewUrl,
  onContinue,
  onVerify,
  onClose,
}: MemoSigningDialogProps) {
  const { t } = useTranslation('crd-space');
  const message = t(`memo.signing.stage.${stage}` as const);
  const busy = stage === 'preparing' || stage === 'continuing' || stage === 'checking';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="z-[70]" className="z-[70] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t(stage === 'idle' ? 'memo.signing.signedCopies' : 'memo.signing.title')}</DialogTitle>
          <DialogDescription>{t('memo.signing.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto">
          <output aria-label={message} className="flex items-center gap-2 text-body">
            {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {message}
          </output>
          {previewUrl && (
            <div className="space-y-2">
              <iframe title={t('memo.signing.previewTitle')} src={previewUrl} className="h-[55vh] w-full border" />
              <a className="text-primary underline" href={previewUrl} target="_blank" rel="noreferrer">
                {t('memo.signing.openPreview')}
              </a>
            </div>
          )}
          {signatures.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-subsection-title">{t('memo.signing.signedCopies')}</h3>
              <ul className="space-y-2">
                {signatures.map(signature =>
                  signature.document ? (
                    <li key={signature.id} className="flex flex-wrap items-center gap-2 border-t pt-2 text-body">
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
                      <a className="text-primary underline" href={signature.document.url} download={true}>
                        {t('memo.signing.download')}
                      </a>
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
                      {signature.verification && (
                        <output>{t(`memo.signing.verification.${signature.verification}` as const)}</output>
                      )}
                    </li>
                  ) : null
                )}
              </ul>
              <p className="text-caption text-muted-foreground">{t('memo.signing.standardTools')}</p>
            </section>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('memo.close')}
          </Button>
          {previewUrl && (stage === 'preview' || stage === 'continuing') && (
            <Button type="button" onClick={onContinue} disabled={stage === 'continuing'}>
              {stage === 'continuing' ? t('memo.signing.continuing') : t('memo.signing.continue')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
