import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';
import type { CreateInnovationPackDialogProps } from './types';

/**
 * Create-pack dialog — collects ONLY name + description, mirroring the legacy
 * MUI `CreateInnovationPackDialog`. On submit the host sends `{ accountID,
 * profileData: { displayName, description } }` via `useCreateInnovationPack`;
 * once the new pack id is returned the host navigates to `<pack.url>/settings`
 * for the rest of the details (avatar / tags / references / store-listing /
 * search-visibility).
 *
 * Pure CRD — controlled (`value`/`onChange`); behaviour is the host's.
 */
export function CreateInnovationPackDialog({
  open,
  onClose,
  value,
  errors,
  onChange,
  onCreate,
  creating,
}: CreateInnovationPackDialogProps) {
  const { t } = useTranslation('crd-templates');
  const hasBlockingError = Boolean(errors.name);

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && !creating && onClose()}>
      <DialogContent className="w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('createPack.title')}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto"
          onSubmit={e => {
            e.preventDefault();
            if (!hasBlockingError) onCreate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="create-pack-name">{t('createPack.name')}</Label>
            <Input
              id="create-pack-name"
              value={value.name}
              onChange={e => onChange({ ...value, name: e.target.value })}
              placeholder={t('createPack.namePlaceholder')}
              autoFocus={true}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'create-pack-name-error' : undefined}
            />
            {errors.name && (
              <p id="create-pack-name-error" className="text-caption text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-pack-description">{t('createPack.description')}</Label>
            <Textarea
              id="create-pack-description"
              value={value.description}
              onChange={e => onChange({ ...value, description: e.target.value })}
              placeholder={t('createPack.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          {/* Hidden submit so Enter triggers create when focus is in a field. */}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} disabled={creating}>
            {t('createPack.cancel')}
          </Button>
          <Button variant="default" onClick={onCreate} disabled={creating || hasBlockingError} aria-busy={creating}>
            {creating && <Loader2 aria-hidden="true" className="size-4 mr-2 animate-spin" />}
            {t('createPack.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
