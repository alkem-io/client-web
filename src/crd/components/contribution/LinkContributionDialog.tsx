import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

export type LinkContributionFormValues = {
  url: string;
  displayName: string;
  description: string;
};

type LinkContributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialValues?: Partial<LinkContributionFormValues>;
  saving?: boolean;
  /** When provided in edit mode, renders a delete button in the footer. */
  onDelete?: () => void;
  onSubmit: (values: LinkContributionFormValues) => void;
};

const URL_RE = /^https?:\/\/[^\s]+$/i;

export function LinkContributionDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  saving,
  onDelete,
  onSubmit,
}: LinkContributionDialogProps) {
  const { t } = useTranslation('crd-space');
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [urlError, setUrlError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setUrl(initialValues?.url ?? '');
    setDisplayName(initialValues?.displayName ?? '');
    setDescription(initialValues?.description ?? '');
    setUrlError(undefined);
    setNameError(undefined);
  }, [open, initialValues?.url, initialValues?.displayName, initialValues?.description]);

  const handleSubmit = () => {
    const trimmedUrl = url.trim();
    const trimmedName = displayName.trim();
    let valid = true;
    if (!URL_RE.test(trimmedUrl)) {
      setUrlError(t('callout.linkUrlInvalid'));
      valid = false;
    } else {
      setUrlError(undefined);
    }
    if (!trimmedName) {
      setNameError(t('callout.linkNameRequired'));
      valid = false;
    } else {
      setNameError(undefined);
    }
    if (!valid) return;
    onSubmit({ url: trimmedUrl, displayName: trimmedName, description: description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('callout.createLink') : t('callout.editLink')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="crd-link-url" className="text-caption text-muted-foreground">
              {t('callout.linkUrlLabel')}
            </label>
            <Input
              id="crd-link-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={t('callout.linkUrlPlaceholder')}
              autoFocus={true}
              disabled={saving}
              className={cn(urlError && 'border-destructive')}
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? 'crd-link-url-error' : undefined}
            />
            {urlError && (
              <p id="crd-link-url-error" className="text-caption text-destructive">
                {urlError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="crd-link-name" className="text-caption text-muted-foreground">
              {t('callout.linkNameLabel')}
            </label>
            <Input
              id="crd-link-name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('callout.linkNamePlaceholder')}
              disabled={saving}
              className={cn(nameError && 'border-destructive')}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'crd-link-name-error' : undefined}
            />
            {nameError && (
              <p id="crd-link-name-error" className="text-caption text-destructive">
                {nameError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="crd-link-description" className="text-caption text-muted-foreground">
              {t('callout.linkDescriptionLabel')}
            </label>
            <textarea
              id="crd-link-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('callout.linkDescriptionPlaceholder')}
              disabled={saving}
              className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-control resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {mode === 'edit' && onDelete ? (
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={saving}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 size-4" aria-hidden="true" />
              {t('callout.linkDelete')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={saving} aria-busy={saving}>
              {mode === 'create' ? t('callout.linkCreate') : t('callout.linkSave')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
