import { ImageIcon, LayoutTemplate, Loader2, X } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateContentPreview } from '@/crd/components/templates/TemplateContentPreview';
import type { TemplateContent } from '@/crd/components/templates/types';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
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
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

export type CreateSubspaceFormValues = {
  displayName: string;
  tagline: string;
  description: string;
  tags: string[];
  spaceTemplateId: string;
  avatarFile: File | null;
  cardBannerFile: File | null;
};

export type CreateSubspaceFieldErrors = Partial<Record<keyof CreateSubspaceFormValues, string | undefined>>;

export type CreateSubspaceVisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};

export type CreateSubspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CreateSubspaceFormValues;
  errors: CreateSubspaceFieldErrors;
  /** Display name of the currently selected Space template, if any. */
  selectedTemplateName?: string;
  /** Mapped content of the selected Space template — rendered as a preview below the selector. */
  selectedTemplateContent?: TemplateContent;
  /** True while the selected template's content is being fetched. */
  selectedTemplateLoading?: boolean;
  /** Opens the shared template picker (rendered by the consumer). */
  onOpenTemplatePicker: () => void;
  /** Clears the selected template — the subspace is then created blank / from scratch. */
  onClearTemplate: () => void;
  submitting: boolean;
  canSubmit: boolean;
  avatarConstraints: CreateSubspaceVisualConstraints | null;
  cardBannerConstraints: CreateSubspaceVisualConstraints | null;
  onChange: (patch: Partial<CreateSubspaceFormValues>) => void;
  onSubmit: () => void;
};

/**
 * CRD equivalent of the MUI `CreateSubspaceForm` wrapped in a dialog. Plain-
 * props presentational component — the parent owns form state, validation, and
 * the submit mutation.
 */
export function CreateSubspaceDialog({
  open,
  onOpenChange,
  values,
  errors,
  selectedTemplateName,
  selectedTemplateContent,
  selectedTemplateLoading,
  onOpenTemplatePicker,
  onClearTemplate,
  submitting,
  canSubmit,
  avatarConstraints,
  cardBannerConstraints,
  onChange,
  onSubmit,
}: CreateSubspaceDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('subspaces.createDialog.dialog.title')}</DialogTitle>
          <DialogDescription>{t('subspaces.createDialog.dialog.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Template */}
          <FieldShell
            id="subspace-template"
            label={t('subspaces.createDialog.template.label')}
            hint={t('subspaces.createDialog.template.hint')}
          >
            {values.spaceTemplateId ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                {selectedTemplateLoading ? (
                  <span className="text-control text-muted-foreground inline-flex flex-1 items-center gap-2">
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    {t('subspaces.createDialog.template.loadingPreview')}
                  </span>
                ) : (
                  <span className="text-control flex-1 truncate">
                    {selectedTemplateName ?? t('subspaces.createDialog.template.selectedLabel')}
                  </span>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={onOpenTemplatePicker} disabled={submitting}>
                  {t('subspaces.createDialog.template.change')}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={onClearTemplate} disabled={submitting}>
                  {t('subspaces.createDialog.template.clear')}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenTemplatePicker}
                disabled={submitting}
                className="justify-start"
              >
                <LayoutTemplate aria-hidden="true" className="mr-2 size-4" />
                {t('subspaces.createDialog.template.choose')}
              </Button>
            )}
            {values.spaceTemplateId && !selectedTemplateLoading && selectedTemplateContent ? (
              <div className="mt-2 rounded-md border bg-muted/20 p-3">
                <TemplateContentPreview content={selectedTemplateContent} />
              </div>
            ) : null}
          </FieldShell>

          {/* Display Name */}
          <FieldShell
            id="subspace-displayName"
            label={t('subspaces.createDialog.displayName.label')}
            required={true}
            hint={t('subspaces.createDialog.displayName.hint')}
            error={errors.displayName}
          >
            <Input
              id="subspace-displayName"
              value={values.displayName}
              onChange={e => onChange({ displayName: e.target.value })}
              placeholder={t('subspaces.createDialog.displayName.placeholder')}
              disabled={submitting}
              aria-invalid={!!errors.displayName}
              className={errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
          </FieldShell>

          {/* Tagline */}
          <FieldShell
            id="subspace-tagline"
            label={t('subspaces.createDialog.tagline.label')}
            hint={t('subspaces.createDialog.tagline.hint')}
            error={errors.tagline}
          >
            <Input
              id="subspace-tagline"
              value={values.tagline}
              onChange={e => onChange({ tagline: e.target.value })}
              placeholder={t('subspaces.createDialog.tagline.placeholder')}
              disabled={submitting}
              aria-invalid={!!errors.tagline}
              className={errors.tagline ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
          </FieldShell>

          {/* Description */}
          <FieldShell
            id="subspace-description"
            label={t('subspaces.createDialog.description.label')}
            hint={t('subspaces.createDialog.description.hint')}
            error={errors.description}
          >
            <MarkdownEditor
              value={values.description}
              onChange={next => onChange({ description: next })}
              placeholder={t('subspaces.createDialog.description.placeholder')}
            />
          </FieldShell>

          {/* Tags */}
          <FieldShell
            id="subspace-tags"
            label={t('subspaces.createDialog.tags.label')}
            hint={t('subspaces.createDialog.tags.hint')}
          >
            <TagsInput
              value={values.tags}
              onChange={next => onChange({ tags: next })}
              placeholder={t('subspaces.createDialog.tags.placeholder')}
            />
          </FieldShell>

          {/* Visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FileField
              id="subspace-avatar"
              label={t('subspaces.createDialog.avatar.label')}
              file={values.avatarFile}
              onChange={file => onChange({ avatarFile: file })}
              disabled={submitting}
              placeholderText={t('subspaces.createDialog.avatar.upload')}
              constraints={avatarConstraints}
              error={errors.avatarFile}
              aspectClassName="aspect-square"
            />
            <FileField
              id="subspace-cardBanner"
              label={t('subspaces.createDialog.cardBanner.label')}
              file={values.cardBannerFile}
              onChange={file => onChange({ cardBannerFile: file })}
              disabled={submitting}
              placeholderText={t('subspaces.createDialog.cardBanner.upload')}
              constraints={cardBannerConstraints}
              error={errors.cardBannerFile}
              aspectClassName="aspect-video"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('subspaces.createDialog.cancel')}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                {t('subspaces.createDialog.creating')}
              </>
            ) : (
              t('subspaces.createDialog.submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldShell({
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function FileField({
  id,
  label,
  file,
  onChange,
  placeholderText,
  aspectClassName,
  disabled,
  constraints,
  error,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  placeholderText: string;
  aspectClassName: string;
  disabled?: boolean;
  constraints: CreateSubspaceVisualConstraints | null;
  error?: string;
}) {
  const { t } = useTranslation('crd-spaceSettings');
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const acceptAttr = constraints?.allowedTypes?.length
    ? constraints.allowedTypes.map(ext => (ext.startsWith('.') ? ext : `.${ext}`)).join(',')
    : 'image/*';

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          'relative overflow-hidden rounded-md border border-dashed bg-muted/30',
          error && 'border-destructive',
          aspectClassName
        )}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 text-foreground shadow hover:bg-background"
              aria-label={t('subspaces.createDialog.visuals.remove')}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground text-sm hover:bg-muted/50 cursor-pointer"
          >
            <ImageIcon aria-hidden="true" className="size-4" />
            {placeholderText}
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={acceptAttr}
          className="hidden"
          disabled={disabled}
          onChange={e => {
            const picked = e.target.files?.[0] ?? null;
            onChange(picked);
            if (e.target) e.target.value = '';
          }}
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : constraints ? (
        <p className="text-xs text-muted-foreground">
          {t('subspaces.createDialog.visuals.resolutionHint', {
            width: constraints.maxWidth,
            height: constraints.maxHeight,
          })}
        </p>
      ) : null}
    </div>
  );
}
