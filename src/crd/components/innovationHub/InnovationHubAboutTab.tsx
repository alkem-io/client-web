import { Pencil, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Separator } from '@/crd/primitives/separator';
import { InlineSectionSave } from './InlineSectionSave';

export type HubAboutFormValues = {
  subdomain: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  bannerImageUrl?: string;
};

export type HubAboutSectionKey = 'subdomain' | 'name' | 'tagline' | 'description' | 'tags' | 'banner';

export type HubAboutSectionSaveStatus = 'idle' | 'saving' | 'saved';

export type InnovationHubAboutTabProps = {
  values: HubAboutFormValues;
  dirty: Partial<Record<HubAboutSectionKey, boolean>>;
  saveStatus: Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>;
  errors: Partial<Record<HubAboutSectionKey, string>>;
  onChange: (patch: Partial<HubAboutFormValues>) => void;
  onSaveSection: (key: HubAboutSectionKey) => void;
  onBannerFileSelected: (file: File) => void;
  bannerUploading: boolean;
} & MarkdownUploadProps;

const EditPencil = ({ className }: { className?: string }) => (
  <span
    className={cn('pointer-events-none inline-flex items-center justify-center text-muted-foreground/50', className)}
    aria-hidden="true"
  >
    <Pencil className="size-3.5" />
  </span>
);

export const InnovationHubAboutTab = ({
  values,
  dirty,
  saveStatus,
  errors,
  onChange,
  onSaveSection,
  onBannerFileSelected,
  bannerUploading,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: InnovationHubAboutTabProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBannerFileSelected(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-page-title">{t('settings.tabs.about')}</h2>
      </div>

      <Separator />

      {/* Subdomain — read-only; immutable post-creation per the GraphQL schema (mirrors the legacy form). */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.subdomain.label')}</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input name="subdomain" value={values.subdomain} readOnly={true} disabled={true} aria-readonly="true" />
          </div>
          <p className="text-caption text-muted-foreground">{t('settings.about.subdomain.readOnlyHelp')}</p>
        </div>
      </section>

      <Separator />

      {/* Name */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.name.label')}</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input
              name="name"
              value={values.name}
              onChange={e => onChange({ name: e.target.value })}
              placeholder={t('settings.about.name.placeholder')}
              aria-invalid={errors.name ? 'true' : undefined}
            />
            <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSectionSave
              dirty={!!dirty.name}
              status={saveStatus.name ?? 'idle'}
              onSave={() => onSaveSection('name')}
              error={errors.name}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Tagline */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.tagline.label')}</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input
              name="tagline"
              value={values.tagline}
              onChange={e => onChange({ tagline: e.target.value })}
              placeholder={t('settings.about.tagline.placeholder')}
              aria-invalid={errors.tagline ? 'true' : undefined}
            />
            <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSectionSave
              dirty={!!dirty.tagline}
              status={saveStatus.tagline ?? 'idle'}
              onSave={() => onSaveSection('tagline')}
              error={errors.tagline}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Description */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.description.label')}</Label>
        <div className="mt-2 space-y-2">
          <MarkdownEditor
            value={values.description}
            onChange={next => onChange({ description: next })}
            onImageUpload={onImageUpload}
            iframeAllowedUrls={iframeAllowedUrls}
            onError={onError}
          />
          <div className="flex items-center justify-end gap-2">
            <InlineSectionSave
              dirty={!!dirty.description}
              status={saveStatus.description ?? 'idle'}
              onSave={() => onSaveSection('description')}
              error={errors.description}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.tags.label')}</Label>
        <div className="mt-2 space-y-3">
          <TagsInput
            value={values.tags}
            onChange={next => onChange({ tags: next })}
            placeholder={t('settings.about.tags.placeholder')}
          />
          <div className="flex items-center justify-end gap-2">
            <InlineSectionSave
              dirty={!!dirty.tags}
              status={saveStatus.tags ?? 'idle'}
              onSave={() => onSaveSection('tags')}
              error={errors.tags}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Banner */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">{t('settings.about.banner.label')}</Label>
        <div className="mt-3 space-y-3">
          <div className="group relative h-48 w-full overflow-hidden rounded-xl border border-border bg-muted/50">
            {values.bannerImageUrl && (
              <img
                src={values.bannerImageUrl}
                alt={values.name}
                className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={handleBannerClick}
                disabled={bannerUploading}
                aria-busy={bannerUploading}
              >
                <Upload aria-hidden="true" className="size-4" />
                {bannerUploading ? t('settings.about.banner.uploading') : t('settings.about.banner.change')}
              </Button>
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <p className="text-caption text-muted-foreground">{t('settings.about.banner.helperText')}</p>
          {errors.banner && (
            <p role="alert" className="text-caption text-destructive">
              {errors.banner}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
