import { ImageIcon, LayoutTemplate, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { TemplateContentPreview } from '@/crd/components/templates/TemplateContentPreview';
import type { TemplateContent } from '@/crd/components/templates/types';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
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

export type CreateSpaceFormValues = {
  displayName: string;
  /** URL slug (`nameID`). Auto-derived from displayName until the user edits it. */
  nameId: string;
  tagline: string;
  description: string;
  tags: string[];
  spaceTemplateId: string;
  /** Page banner (VisualType.Banner). */
  bannerFile: File | null;
  /** Card banner (VisualType.Card). */
  cardBannerFile: File | null;
  addTutorialCallouts: boolean;
  acceptedTerms: boolean;
};

export type CreateSpaceFieldErrors = Partial<Record<keyof CreateSpaceFormValues, string | undefined>>;

export type CreateSpaceVisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};

export type CreateSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CreateSpaceFormValues;
  errors: CreateSpaceFieldErrors;
  /** Display name of the currently selected Space template, if any. */
  selectedTemplateName?: string;
  /** Mapped content of the selected Space template — rendered as a preview below the selector. */
  selectedTemplateContent?: TemplateContent;
  /** True while the selected template's content is being fetched. */
  selectedTemplateLoading?: boolean;
  /** Opens the shared template picker (rendered by the consumer). */
  onOpenTemplatePicker: () => void;
  /** Clears the selected template — the Space is then created blank. */
  onClearTemplate: () => void;
  bannerConstraints: CreateSpaceVisualConstraints | null;
  cardBannerConstraints: CreateSpaceVisualConstraints | null;
  /** External "read more" Terms & Conditions URL (from platform config, passed in). */
  termsUrl?: string;
  /** Origin shown as the slug prefix, e.g. "https://alkem.io/" (lowercased). Falls back to the i18n prefix. */
  urlPrefix?: string;
  /** Organization account name for the subtitle; omitted for the user's own account. */
  accountName?: string;
  submitting: boolean;
  canSubmit: boolean;
  /** True when the account has no available Space plan — shows the no-plan message and blocks submit. */
  noPlanAvailable: boolean;
  onChange: (patch: Partial<CreateSpaceFormValues>) => void;
  onSubmit: () => void;
} & MarkdownUploadProps;

/**
 * CRD Create Space dialog — a clone of {@link CreateSubspaceDialog} adapted for
 * top-level (L0) Spaces: the avatar is replaced by a Page Banner, a URL slug
 * field is added, and the form ends with the "Add Tutorials" and required
 * "Accept terms" checkboxes (the latter opening a terms dialog). The markdown
 * Description is kept. Plain-props presentational component — the parent owns
 * form state, validation, plan selection, and the submit mutation.
 */
export function CreateSpaceDialog({
  open,
  onOpenChange,
  values,
  errors,
  selectedTemplateName,
  selectedTemplateContent,
  selectedTemplateLoading,
  onOpenTemplatePicker,
  onClearTemplate,
  bannerConstraints,
  cardBannerConstraints,
  termsUrl,
  urlPrefix,
  accountName,
  submitting,
  canSubmit,
  noPlanAvailable,
  onChange,
  onSubmit,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: CreateSpaceDialogProps) {
  const { t } = useTranslation('crd-createSpace');
  const [termsOpen, setTermsOpen] = useState(false);

  const isDirty =
    values.displayName.trim() !== '' ||
    values.nameId.trim() !== '' ||
    values.tagline.trim() !== '' ||
    values.description.trim() !== '' ||
    values.tags.length > 0 ||
    values.spaceTemplateId !== '' ||
    values.bannerFile !== null ||
    values.cardBannerFile !== null ||
    values.addTutorialCallouts;

  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: () => onOpenChange(false),
    blockClose: submitting,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
          <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>
              {accountName ? t('dialog.subtitleForAccount', { account: accountName }) : t('dialog.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-4">
            {/* Template */}
            <FieldShell id="space-template" label={t('template.label')} hint={t('template.hint')}>
              {values.spaceTemplateId ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  {selectedTemplateLoading ? (
                    <span className="text-control text-muted-foreground inline-flex flex-1 items-center gap-2">
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                      {t('template.loadingPreview')}
                    </span>
                  ) : (
                    <span className="text-control flex-1 truncate">
                      {selectedTemplateName ?? t('template.selectedLabel')}
                    </span>
                  )}
                  <Button type="button" variant="ghost" size="sm" onClick={onOpenTemplatePicker} disabled={submitting}>
                    {t('template.change')}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={onClearTemplate} disabled={submitting}>
                    {t('template.clear')}
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
                  {t('template.choose')}
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
              id="space-displayName"
              label={t('displayName.label')}
              required={true}
              hint={t('displayName.hint')}
              error={errors.displayName}
            >
              <Input
                id="space-displayName"
                value={values.displayName}
                onChange={e => onChange({ displayName: e.target.value })}
                placeholder={t('displayName.placeholder')}
                disabled={submitting}
                aria-invalid={!!errors.displayName}
                className={errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </FieldShell>

            {/* URL slug */}
            <FieldShell
              id="space-nameId"
              label={t('slug.label')}
              required={true}
              hint={t('slug.hint')}
              error={errors.nameId}
            >
              <div
                className={cn(
                  'flex items-center rounded-md border bg-background px-3 focus-within:ring-1 focus-within:ring-ring',
                  errors.nameId && 'border-destructive focus-within:ring-destructive'
                )}
              >
                <span className="text-control text-muted-foreground shrink-0 select-none lowercase">
                  {urlPrefix ?? t('slug.prefix')}
                </span>
                <Input
                  id="space-nameId"
                  value={values.nameId}
                  onChange={e => onChange({ nameId: e.target.value })}
                  placeholder={t('slug.placeholder')}
                  disabled={submitting}
                  aria-invalid={!!errors.nameId}
                  className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 pl-0"
                />
              </div>
            </FieldShell>

            {/* Tagline */}
            <FieldShell id="space-tagline" label={t('tagline.label')} hint={t('tagline.hint')} error={errors.tagline}>
              <Input
                id="space-tagline"
                value={values.tagline}
                onChange={e => onChange({ tagline: e.target.value })}
                placeholder={t('tagline.placeholder')}
                disabled={submitting}
                aria-invalid={!!errors.tagline}
                className={errors.tagline ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </FieldShell>

            {/* Description */}
            <FieldShell
              id="space-description"
              label={t('description.label')}
              hint={t('description.hint')}
              error={errors.description}
            >
              <MarkdownEditor
                value={values.description}
                onChange={next => onChange({ description: next })}
                placeholder={t('description.placeholder')}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
            </FieldShell>

            {/* Tags */}
            <FieldShell id="space-tags" label={t('tags.label')} hint={t('tags.hint')}>
              <TagsInput
                value={values.tags}
                onChange={next => onChange({ tags: next })}
                placeholder={t('tags.placeholder')}
              />
            </FieldShell>

            {/* Visuals — page banner (left) + card banner (right) side by side on wide screens */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FileField
                id="space-banner"
                label={t('banner.label')}
                file={values.bannerFile}
                onChange={file => onChange({ bannerFile: file })}
                disabled={submitting}
                placeholderText={t('banner.upload')}
                constraints={bannerConstraints}
                error={errors.bannerFile}
                aspectClassName="aspect-[3/1]"
              />
              <FileField
                id="space-cardBanner"
                label={t('cardBanner.label')}
                file={values.cardBannerFile}
                onChange={file => onChange({ cardBannerFile: file })}
                disabled={submitting}
                placeholderText={t('cardBanner.upload')}
                constraints={cardBannerConstraints}
                error={errors.cardBannerFile}
                aspectClassName="aspect-video"
              />
            </div>

            {/* Tutorials (the gating Accept-terms checkbox lives in the footer) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <p className="text-body-emphasis">{t('addTutorials.header')}</p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="space-addTutorials"
                  className="mt-0.5"
                  checked={values.addTutorialCallouts}
                  onCheckedChange={checked => onChange({ addTutorialCallouts: checked === true })}
                  disabled={submitting}
                />
                <Label htmlFor="space-addTutorials" className="text-body font-normal leading-snug cursor-pointer">
                  {t('addTutorials.label')}
                </Label>
              </div>
            </div>

            {noPlanAvailable ? (
              <p className="text-caption text-destructive" role="alert">
                {t('license.noPlans')}
              </p>
            ) : null}
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="space-terms"
                  checked={values.acceptedTerms}
                  onCheckedChange={checked => onChange({ acceptedTerms: checked === true })}
                  disabled={submitting}
                  aria-invalid={!!errors.acceptedTerms}
                  className="mt-0.5"
                />
                <Label htmlFor="space-terms" className="text-caption font-normal cursor-pointer text-left block">
                  <Trans
                    t={t}
                    i18nKey="terms.checkboxLabel"
                    components={{
                      terms: (
                        <button
                          type="button"
                          className="cursor-pointer text-primary underline [font:inherit]"
                          onClick={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            setTermsOpen(true);
                          }}
                        />
                      ),
                    }}
                  />
                </Label>
              </div>
              {errors.acceptedTerms ? (
                <p className="text-caption text-destructive pl-6">{errors.acceptedTerms}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <Button type="button" variant="ghost" onClick={requestClose} disabled={submitting}>
                {t('cancel')}
              </Button>
              <Button type="button" onClick={onSubmit} disabled={!canSubmit || submitting} aria-busy={submitting}>
                {submitting ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('terms.dialogTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">{t('terms.dialogContent')}</p>
          <a
            href={termsUrl ?? t('terms.url')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-emphasis text-primary underline"
          >
            {t('terms.fullTermsLink')}
          </a>
        </DialogContent>
      </Dialog>

      {guardElement}
    </>
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
        <p className="text-caption text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-caption text-muted-foreground">{hint}</p>
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
  constraints: CreateSpaceVisualConstraints | null;
  error?: string;
}) {
  const { t } = useTranslation('crd-createSpace');
  const inputRef = useRef<HTMLInputElement>(null);
  // Create the object URL once per file and revoke it on change/unmount so blob
  // URLs don't leak across re-renders or repeated image picks.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // `allowedTypes` are MIME types (e.g. "image/png") — use them verbatim, matching
  // the legacy FileUploadWrapper / CreateSubspaceDialog.
  const acceptAttr = constraints?.allowedTypes?.length ? constraints.allowedTypes.join(',') : 'image/*';

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          'relative overflow-hidden rounded-md border border-dashed bg-muted/30',
          error && 'border-destructive',
          // Real aspect from the visual constraints (authoritative); the class is
          // only a fallback until constraints load.
          !constraints?.aspectRatio && aspectClassName
        )}
        style={constraints?.aspectRatio ? { aspectRatio: constraints.aspectRatio } : undefined}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 text-foreground shadow hover:bg-background"
              aria-label={t('visuals.remove')}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground text-control hover:bg-muted/50 cursor-pointer"
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
        <p className="text-caption text-destructive">{error}</p>
      ) : constraints ? (
        <p className="text-caption text-muted-foreground">
          {t('visuals.resolutionHint', { width: constraints.maxWidth, height: constraints.maxHeight })}
        </p>
      ) : null}
    </div>
  );
}
