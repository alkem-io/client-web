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
import type { CreateInnovationPackDialogProps } from './types';

/**
 * Create-pack dialog — collects name + a required markdown description, mirroring
 * the legacy MUI `CreateInnovationPackDialog` (strict parity). The remaining
 * details (avatar / tags / references / store-listing / search-visibility) are
 * edited afterwards on the pack settings page.
 *
 * Pure CRD — controlled (`value`/`onChange`), validation arrives via `errors`,
 * behaviour is the host's. The markdown editor's image-upload wiring arrives via
 * the spread `MarkdownUploadProps` (supplied by the integration connector).
 */
export function CreateInnovationPackDialog({
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
}: CreateInnovationPackDialogProps) {
  const { t } = useTranslation('crd-templates');
  // Disable Create from `canSubmit` (live validity) when provided, so the button can be disabled
  // while no errors are shown yet. Fall back to errors-derived blocking for the legacy MUI caller.
  const blocked = canSubmit === undefined ? Object.values(errors).some(Boolean) : !canSubmit;

  const isDirty = value.name.trim() !== '' || value.description.trim() !== '';
  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose,
    blockClose: creating,
  });

  const subtitle = accountName
    ? t('createPack.subtitleAccount', { account: accountName })
    : t('createPack.subtitleUser');

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('createPack.title')}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto"
            onSubmit={e => {
              e.preventDefault();
              if (!blocked) onCreate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="create-pack-name" className={errors.name ? 'text-destructive' : undefined}>
                {t('createPack.name')}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="create-pack-name"
                value={value.name}
                onChange={e => onChange({ ...value, name: e.target.value })}
                placeholder={t('createPack.namePlaceholder')}
                autoFocus={true}
                disabled={creating}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'create-pack-name-error' : undefined}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.name && (
                <p id="create-pack-name-error" className="text-caption text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-pack-description" className={errors.description ? 'text-destructive' : undefined}>
                {t('createPack.description')}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <MarkdownEditor
                id="create-pack-description"
                value={value.description}
                onChange={next => onChange({ ...value, description: next })}
                placeholder={t('createPack.descriptionPlaceholder')}
                disabled={creating}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
              {errors.description && (
                <p id="create-pack-description-error" className="text-caption text-destructive">
                  {errors.description}
                </p>
              )}
            </div>

            <p className="text-caption text-muted-foreground">{t('createPack.saveForMoreDetails')}</p>

            {/* Hidden submit so Enter triggers create when focus is in a field. */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={requestClose} disabled={creating}>
              {t('createPack.cancel')}
            </Button>
            <Button variant="default" onClick={onCreate} disabled={creating || blocked} aria-busy={creating}>
              {creating && <Loader2 aria-hidden="true" className="size-4 mr-2 animate-spin" />}
              {creating ? t('createPack.creating') : t('createPack.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
