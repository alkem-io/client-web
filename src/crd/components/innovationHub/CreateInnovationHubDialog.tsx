import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
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
import type { CreateInnovationHubDialogProps } from './createInnovationHub.types';

/**
 * Create-hub dialog — collects subdomain + name + tagline + a required markdown
 * description, mirroring the legacy MUI `CreateInnovationHubDialog` (strict parity).
 * Tags and banner are edited afterwards on the hub settings page.
 *
 * Pure CRD — controlled (`value`/`onChange`), validation arrives via `errors`,
 * behaviour is the host's. Markdown image-upload wiring arrives via the spread
 * `MarkdownUploadProps` (supplied by the integration connector).
 */
export function CreateInnovationHubDialog({
  open,
  onClose,
  value,
  errors,
  onChange,
  onCreate,
  creating,
  canSubmit,
  accountName,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: CreateInnovationHubDialogProps) {
  const { t } = useTranslation('crd-innovationHub');
  // Disable Create from `canSubmit` (live validity) when provided; fall back to errors otherwise.
  const blocked = canSubmit === undefined ? Object.values(errors).some(Boolean) : !canSubmit;

  const isDirty =
    value.subdomain.trim() !== '' ||
    value.name.trim() !== '' ||
    value.tagline.trim() !== '' ||
    value.description.trim() !== '';
  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose,
    blockClose: creating,
  });

  const subtitle = accountName ? t('createHub.subtitleAccount', { account: accountName }) : t('createHub.subtitleUser');

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('createHub.title')}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto"
            onSubmit={e => {
              e.preventDefault();
              if (!blocked) onCreate();
            }}
          >
            <Field
              id="create-hub-subdomain"
              label={t('createHub.subdomain')}
              required={true}
              error={errors.subdomain}
              hint={t('createHub.subdomainHint')}
            >
              <Input
                id="create-hub-subdomain"
                value={value.subdomain}
                onChange={e => onChange({ ...value, subdomain: e.target.value })}
                placeholder={t('createHub.subdomainPlaceholder')}
                autoFocus={true}
                disabled={creating}
                aria-invalid={Boolean(errors.subdomain)}
                aria-describedby={errors.subdomain ? 'create-hub-subdomain-error' : undefined}
                className={errors.subdomain ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </Field>

            <Field id="create-hub-name" label={t('createHub.name')} required={true} error={errors.name}>
              <Input
                id="create-hub-name"
                value={value.name}
                onChange={e => onChange({ ...value, name: e.target.value })}
                placeholder={t('createHub.namePlaceholder')}
                disabled={creating}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'create-hub-name-error' : undefined}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </Field>

            <Field id="create-hub-tagline" label={t('createHub.tagline')} error={errors.tagline}>
              <Input
                id="create-hub-tagline"
                value={value.tagline}
                onChange={e => onChange({ ...value, tagline: e.target.value })}
                placeholder={t('createHub.taglinePlaceholder')}
                disabled={creating}
                aria-invalid={Boolean(errors.tagline)}
                aria-describedby={errors.tagline ? 'create-hub-tagline-error' : undefined}
                className={errors.tagline ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </Field>

            <Field
              id="create-hub-description"
              label={t('createHub.description')}
              required={true}
              error={errors.description}
            >
              <MarkdownEditor
                id="create-hub-description"
                value={value.description}
                onChange={next => onChange({ ...value, description: next })}
                placeholder={t('createHub.descriptionPlaceholder')}
                disabled={creating}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
            </Field>

            <p className="text-caption text-muted-foreground">{t('createHub.saveForMoreDetails')}</p>

            {/* Hidden submit so Enter triggers create when focus is in a field. */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={requestClose} disabled={creating}>
              {t('createHub.cancel')}
            </Button>
            <Button variant="default" onClick={onCreate} disabled={creating || blocked} aria-busy={creating}>
              {creating && <Loader2 aria-hidden="true" className="size-4 mr-2 animate-spin" />}
              {creating ? t('createHub.creating') : t('createHub.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-caption text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
