import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

export type TemplateEditFormValues = {
  displayName: string;
  description: string;
  tags: string[];
  /** Only shown/editable for post templates. */
  postDefaultDescription?: string;
};

export type TemplateEditFieldErrors = Partial<Record<keyof TemplateEditFormValues, string | undefined>>;

export type TemplateEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Loading the template content for initial form seeding. */
  loading?: boolean;
  submitting?: boolean;
  values: TemplateEditFormValues;
  errors: TemplateEditFieldErrors;
  /** Whether the current template is a Post template (determines if postDefaultDescription is shown). */
  isPostTemplate: boolean;
  /**
   * Informational note rendered under the description when the template type
   * has content beyond the editable profile (e.g. whiteboard content, callout
   * inner structure). Rendered only when non-empty.
   */
  advancedContentNotice?: string;
  onChange: (patch: Partial<TemplateEditFormValues>) => void;
  onSubmit: () => void;
  canSubmit: boolean;
};

/**
 * CRD template edit dialog. Covers the common profile fields (displayName,
 * tagline, description, tags) + Post's default description. Other template
 * types' nested content is intentionally read-only here — those stay editable
 * via the platform admin; this dialog focuses on renames/description edits
 * which cover the bulk of template-admin tweaks.
 */
export function TemplateEditDialog({
  open,
  onOpenChange,
  loading = false,
  submitting = false,
  values,
  errors,
  isPostTemplate,
  advancedContentNotice,
  onChange,
  onSubmit,
  canSubmit,
}: TemplateEditDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('templates.edit.title')}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <Field id="template-edit-name" label={t('templates.edit.name')} required={true} error={errors.displayName}>
              <Input
                id="template-edit-name"
                value={values.displayName}
                onChange={e => onChange({ displayName: e.target.value })}
                disabled={submitting}
                aria-invalid={!!errors.displayName}
                className={errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </Field>

            <Field id="template-edit-description" label={t('templates.edit.description')}>
              <MarkdownEditor
                value={values.description}
                onChange={next => onChange({ description: next })}
                placeholder={t('templates.edit.descriptionPlaceholder')}
              />
            </Field>

            <Field id="template-edit-tags" label={t('templates.edit.tags')}>
              <TagsInput
                value={values.tags}
                onChange={next => onChange({ tags: next })}
                placeholder={t('templates.edit.tagsPlaceholder')}
              />
            </Field>

            {isPostTemplate && (
              <Field id="template-edit-postDefault" label={t('templates.edit.postDefault')}>
                <MarkdownEditor
                  value={values.postDefaultDescription ?? ''}
                  onChange={next => onChange({ postDefaultDescription: next })}
                  placeholder={t('templates.edit.postDefaultPlaceholder')}
                />
              </Field>
            )}

            {advancedContentNotice && (
              <p className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                {advancedContentNotice}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('templates.edit.cancel')}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                {t('templates.edit.saving')}
              </>
            ) : (
              t('templates.edit.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
