import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { TagsInput } from '@/crd/forms/tags-input';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Textarea } from '@/crd/primitives/textarea';
import type { TemplateFormDialogProps } from './types';

export function TemplateFormDialog({
  open,
  intent,
  type,
  commonValue,
  commonErrors,
  onCommonChange,
  perTypeFormSlot,
  submitting,
  onSubmit,
  onCancel,
  isDirty,
}: TemplateFormDialogProps) {
  const { t } = useTranslation('crd-templates');
  const [discardOpen, setDiscardOpen] = useState(false);

  const titleKey = intent === 'create' ? 'form.createTitle' : 'form.editTitle';

  const requestClose = () => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={isOpen => !isOpen && requestClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t(`${titleKey}.${type}`)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">{t('form.common.name')}</Label>
              <Input
                id="tpl-name"
                value={commonValue.name}
                onChange={e => onCommonChange({ ...commonValue, name: e.target.value })}
                placeholder={t('form.common.namePlaceholder')}
                aria-invalid={Boolean(commonErrors.name)}
                aria-describedby={commonErrors.name ? 'tpl-name-error' : undefined}
              />
              {commonErrors.name && (
                <p id="tpl-name-error" className="text-caption text-destructive">
                  {commonErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-description">{t('form.common.description')}</Label>
              <Textarea
                id="tpl-description"
                value={commonValue.description}
                onChange={e => onCommonChange({ ...commonValue, description: e.target.value })}
                placeholder={t('form.common.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-tags">{t('form.common.tags')}</Label>
              <TagsInput
                value={commonValue.tags}
                onChange={tags => onCommonChange({ ...commonValue, tags })}
                placeholder={t('form.common.tagsPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-banner">{t('form.common.banner')}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="tpl-banner"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => onCommonChange({ ...commonValue, bannerFile: e.target.files?.[0] })}
                />
                <Button asChild={true} variant="outline" size="sm">
                  <label htmlFor="tpl-banner" className="cursor-pointer">
                    <Upload aria-hidden="true" className="size-4 mr-2" />
                    {t('form.common.uploadBanner')}
                  </label>
                </Button>
                {commonValue.bannerFile && (
                  <span className="text-caption text-muted-foreground truncate">{commonValue.bannerFile.name}</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t">{perTypeFormSlot}</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={requestClose} disabled={submitting}>
              {t('form.cancel')}
            </Button>
            <Button variant="default" onClick={onSubmit} disabled={submitting} aria-busy={submitting}>
              {submitting && <Loader2 aria-hidden="true" className="size-4 mr-2 animate-spin" />}
              {t('form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title={t('discard.title')}
        description={t('discard.body')}
        confirmLabel={t('discard.confirm')}
        cancelLabel={t('discard.cancel')}
        variant="destructive"
        onConfirm={() => {
          setDiscardOpen(false);
          onCancel();
        }}
      />
    </>
  );
}
