import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
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
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import useResolveSpaceUrl from '@/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl';

type Status =
  | { kind: 'idle' }
  | { kind: 'validating' }
  | { kind: 'invalid' }
  | { kind: 'duplicate' }
  | { kind: 'submitError' };

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export type CrdAddSpaceByUrlDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (spaceId: string) => Promise<void>;
  existingSpaceIds: string[];
};

export const CrdAddSpaceByUrlDialog = ({ open, onClose, onAdd, existingSpaceIds }: CrdAddSpaceByUrlDialogProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const { resolve } = useResolveSpaceUrl();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const requestIdRef = useRef(0);

  const handleClose = () => {
    requestIdRef.current += 1;
    setUrl('');
    setStatus({ kind: 'idle' });
    onClose();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) handleClose();
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    if (status.kind !== 'idle' && status.kind !== 'validating') {
      setStatus({ kind: 'idle' });
    }
  };

  const trimmedUrl = url.trim();
  const submitDisabled = trimmedUrl === '' || !isValidUrl(trimmedUrl) || status.kind === 'validating';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitDisabled) return;
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    setStatus({ kind: 'validating' });
    const result = await resolve(trimmedUrl);
    if (requestIdRef.current !== currentRequestId) return;
    if (result.kind === 'invalid') {
      setStatus({ kind: 'invalid' });
      return;
    }
    if (existingSpaceIds.includes(result.spaceId)) {
      setStatus({ kind: 'duplicate' });
      return;
    }
    try {
      await onAdd(result.spaceId);
      if (requestIdRef.current !== currentRequestId) return;
      setUrl('');
      setStatus({ kind: 'idle' });
      onClose();
    } catch {
      if (requestIdRef.current !== currentRequestId) return;
      setStatus({ kind: 'submitError' });
    }
  };

  const errorMessage =
    status.kind === 'invalid'
      ? t('settings.spaces.addDialog.invalid')
      : status.kind === 'duplicate'
        ? t('settings.spaces.addDialog.duplicate')
        : status.kind === 'submitError'
          ? t('settings.spaces.addDialog.submitError')
          : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('settings.spaces.addDialog.title')}</DialogTitle>
          <DialogDescription>{t('settings.spaces.addDialog.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto">
            <Label htmlFor="add-space-by-url-input">{t('settings.spaces.addDialog.title')}</Label>
            <Input
              id="add-space-by-url-input"
              type="url"
              value={url}
              onChange={handleUrlChange}
              disabled={status.kind === 'validating'}
              placeholder={t('settings.spaces.addDialog.placeholder')}
              autoFocus={true}
              aria-invalid={errorMessage ? 'true' : undefined}
              aria-describedby={errorMessage ? 'add-space-by-url-error' : undefined}
            />
            {errorMessage && (
              <p id="add-space-by-url-error" role="alert" aria-live="polite" className="text-caption text-destructive">
                {errorMessage}
              </p>
            )}
            {status.kind === 'validating' && (
              <p aria-live="polite" className="text-caption inline-flex items-center gap-1 text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
                {t('settings.spaces.addDialog.validating')}
              </p>
            )}
          </div>
          <DialogFooter className="shrink-0">
            <Button type="button" variant="ghost" onClick={handleClose}>
              {t('settings.spaces.addDialog.cancel')}
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {t('settings.spaces.addDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
