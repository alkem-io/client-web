import { ImageIcon, Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReferenceRowsEditor } from '@/crd/components/templates/forms/ReferenceRowsEditor';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Switch } from '@/crd/primitives/switch';
import type { InnovationPackFormProps, SearchVisibilityValue } from './types';

const SEARCH_VISIBILITY_ORDER: readonly SearchVisibilityValue[] = ['public', 'authenticated', 'account'];

/**
 * Pack EDIT form — the heavyweight surface on the pack admin screen.
 *
 * Controlled (`value`/`onChange`); the integration hook (`useInnovationPackAdmin`)
 * owns the submit fan-out across `updateInnovationPack` (+ existing references) /
 * `createReferenceOnProfile` (new refs) / `deleteReference` (removed refs) /
 * `uploadVisual` (queued avatar file).
 *
 * The provider organisation is shown read-only — the legacy `InnovationPackForm`
 * displays the provider as a disabled `TextField`; there is no org picker, and
 * `updateInnovationPack` does not accept a provider field. (`InnovationPackFormProps.providerName`.)
 */
export function InnovationPackForm({
  value,
  errors,
  onChange,
  onSubmit,
  submitting,
  isDirty,
  providerName,
  avatarUrl,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: InnovationPackFormProps) {
  const { t } = useTranslation('crd-templates');
  const formId = useId();
  // Only populate `referenceErrors` when the error value is actually set — an `undefined` value would
  // otherwise count as a blocking error and disable the Save button with no UI indication of why.
  const referenceErrors: Record<string, string | undefined> = {};
  for (const key of Object.keys(errors)) {
    if (key.startsWith('references.') && errors[key]) {
      referenceErrors[key.slice('references.'.length)] = errors[key];
    }
  }
  const hasBlockingError = Boolean(errors.name) || Object.values(referenceErrors).some(Boolean);

  return (
    <form
      className="space-y-6"
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
      aria-busy={submitting}
    >
      {/* Pack name (required) */}
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-name`}>{t('packForm.name')}</Label>
        <Input
          id={`${formId}-name`}
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          placeholder={t('packForm.namePlaceholder')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
        />
        {errors.name && (
          <p id={`${formId}-name-error`} className="text-caption text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* Provider (read-only) */}
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-provider`}>{t('packForm.provider')}</Label>
        <Input id={`${formId}-provider`} value={providerName} disabled={true} readOnly={true} aria-readonly={true} />
        <p className="text-caption text-muted-foreground">{t('packForm.providerHint')}</p>
      </div>

      {/* Avatar */}
      <div className="space-y-1.5">
        <Label>{t('packForm.avatar')}</Label>
        <AvatarUpload
          currentUrl={avatarUrl}
          stagedFile={value.avatarFile}
          onPick={file => onChange({ ...value, avatarFile: file })}
        />
        <p className="text-caption text-muted-foreground">{t('packForm.avatarHint')}</p>
      </div>

      {/* Description (markdown) */}
      <div className="space-y-1.5">
        <Label>{t('packForm.description')}</Label>
        <MarkdownEditor
          value={value.description}
          onChange={description => onChange({ ...value, description })}
          placeholder={t('packForm.descriptionPlaceholder')}
          onImageUpload={onImageUpload}
          iframeAllowedUrls={iframeAllowedUrls}
          onError={onError}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-tags`}>{t('packForm.tags')}</Label>
        <TagsInput
          value={value.tags}
          onChange={tags => onChange({ ...value, tags })}
          placeholder={t('packForm.tagsPlaceholder')}
        />
      </div>

      {/* References */}
      <ReferenceRowsEditor
        value={value.references}
        onChange={references => onChange({ ...value, references })}
        errors={referenceErrors}
        label={t('packForm.references')}
      />

      {/* Listed in store */}
      <div className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-listed`} className="cursor-pointer">
            {t('packForm.listedInStore')}
          </Label>
          <p className="text-caption text-muted-foreground">{t('packForm.listedInStoreHint')}</p>
        </div>
        <Switch
          id={`${formId}-listed`}
          checked={value.listedInStore}
          onCheckedChange={listedInStore => onChange({ ...value, listedInStore })}
          aria-label={t('packForm.listedInStore')}
        />
      </div>

      {/* Search visibility */}
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-search`}>{t('packForm.searchVisibility')}</Label>
        <Select
          value={value.searchVisibility}
          onValueChange={(next: SearchVisibilityValue) => onChange({ ...value, searchVisibility: next })}
        >
          <SelectTrigger id={`${formId}-search`}>
            <SelectValue placeholder={t('packForm.searchVisibility')} />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_VISIBILITY_ORDER.map(opt => (
              <SelectItem key={opt} value={opt}>
                {t(`packForm.searchVisibilityOptions.${opt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-caption text-muted-foreground">
          {t(`packForm.searchVisibilityHints.${value.searchVisibility}`)}
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={submitting || hasBlockingError || !isDirty} aria-busy={submitting}>
          {submitting && <Loader2 aria-hidden="true" className={cn('size-4 mr-2 animate-spin')} />}
          {t('packForm.save')}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Avatar upload — minimal staged-file picker. The integration hook commits the
// queued file via `uploadVisual` on submit; the component just shows a preview.
// ---------------------------------------------------------------------------

function AvatarUpload({
  currentUrl,
  stagedFile,
  onPick,
}: {
  currentUrl?: string;
  stagedFile?: File;
  onPick: (file: File) => void;
}) {
  const { t } = useTranslation('crd-templates');
  const inputRef = useRef<HTMLInputElement>(null);
  // Preview URL: prefer the staged file (blob URL); else fall back to the server image.
  // `URL.createObjectURL` is held in state with a cleanup effect so the blob URL is revoked when the
  // file changes or the component unmounts — otherwise every render would leak a fresh blob.
  const [stagedUrl, setStagedUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!stagedFile) {
      setStagedUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(stagedFile);
    setStagedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [stagedFile]);
  const previewUrl = stagedUrl ?? currentUrl;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="size-20 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-6 text-muted-foreground" />
        )}
      </div>
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <ImageIcon aria-hidden="true" className="size-4 mr-2" />
        {previewUrl ? t('packForm.changeAvatar') : t('packForm.uploadAvatar')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePick}
        aria-label={t('packForm.avatar')}
      />
    </div>
  );
}
