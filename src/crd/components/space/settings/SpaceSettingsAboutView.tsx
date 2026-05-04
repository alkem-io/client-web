import { Check, ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { InlineEditText } from '@/crd/components/common/InlineEditText';
import { SpaceCard, type SpaceCardData } from '@/crd/components/space/SpaceCard';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Separator } from '@/crd/primitives/separator';
import type {
  AboutFormValues,
  AboutReference,
  AboutSectionKey,
  AboutSectionSaveStatus,
  AboutVisual,
  SpaceCardPreview,
  SpaceSettingsLevel,
} from './SpaceSettingsAboutView.types';

export type SpaceSettingsAboutViewProps = AboutFormValues & {
  /**
   * Space hierarchy level. Drives which visuals are editable: L0 spaces show
   * avatar + page banner + card banner; L1/L2 subspaces show avatar + card
   * banner only (subspaces have no page banner).
   */
  level: SpaceSettingsLevel;
  previewCard: SpaceCardPreview;
  countries: ReadonlyArray<{ name: string; code: string }>;
  /** Which sections differ from the server value. */
  dirtyByField: Partial<Record<AboutSectionKey, boolean>>;
  /** Per-section save status (idle / saving / saved / error). */
  saveStatusByField: Partial<Record<AboutSectionKey, AboutSectionSaveStatus>>;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  onAddReference: () => void;
  onUpdateReference: (id: string, patch: Partial<Omit<AboutReference, 'id'>>) => void;
  onRemoveReference: (id: string) => void;
  onSaveSection: (section: AboutSectionKey) => void;
  className?: string;
};

export function SpaceSettingsAboutView(props: SpaceSettingsAboutViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const {
    level,
    name,
    tagline,
    country,
    city,
    avatar,
    pageBanner,
    cardBanner,
    tags,
    references,
    what,
    why,
    who,
    previewCard,
    dirtyByField,
    saveStatusByField,
    onChange,
    onUploadAvatar,
    onUploadPageBanner,
    onUploadCardBanner,
    onAddReference,
    onUpdateReference,
    onRemoveReference,
    onSaveSection,
    className,
  } = props;
  const showPageBanner = level === 'L0';
  // L0 spaces are presented with a full-width page banner and never display
  // an avatar in cards/headers, so the avatar field is hidden at L0. L1/L2
  // subspaces show the avatar overlaid on the parent's banner — see the MUI
  // legacy `EditVisualsView` `visualTypes` filter.
  const showAvatar = level !== 'L0';

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      <div className="mb-6">
        <h2 className="text-page-title">{t('about.pageHeader.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('about.pageHeader.subtitle')}</p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[2fr_1fr] lg:gap-8">
        <div className="flex flex-col min-w-0">
          {/* Space Name */}
          <FieldSection>
            <FieldLabel>{t('about.name.title')}</FieldLabel>
            <InlineEditText
              value={name}
              onChange={next => onChange({ name: next })}
              ariaLabel="Space name"
              editAriaLabel="Edit space name"
              placeholder="Space Name"
              className="mt-2 text-base"
            />
            <FieldFooter
              hint={t('about.name.description')}
              dirty={!!dirtyByField.name}
              status={saveStatusByField.name ?? { kind: 'idle' }}
              onSave={() => onSaveSection('name')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Tagline */}
          <FieldSection>
            <FieldLabel>{t('about.tagline.title')}</FieldLabel>
            <InlineEditText
              value={tagline}
              onChange={next => onChange({ tagline: next })}
              ariaLabel="Tagline"
              editAriaLabel="Edit tagline"
              placeholder="Tagline"
              className="mt-2 text-base"
            />
            <FieldFooter
              hint={t('about.tagline.description')}
              dirty={!!dirtyByField.tagline}
              status={saveStatusByField.tagline ?? { kind: 'idle' }}
              onSave={() => onSaveSection('tagline')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Space Branding */}
          <div className="py-6">
            <h3 className="text-card-title">{t('about.branding.title')}</h3>

            {showAvatar && (
              <div className="mt-4">
                <FieldLabel>{t('about.branding.avatar.title')}</FieldLabel>
                <BannerUpload
                  visual={avatar}
                  onUpload={onUploadAvatar}
                  aspect="aspect-square"
                  widthClass="max-w-[160px]"
                  t={t}
                />
                <FieldHint>{t('about.branding.avatar.hint')}</FieldHint>
              </div>
            )}

            {showPageBanner && (
              <div className="mt-4">
                <FieldLabel>{t('about.branding.pageBanner.title')}</FieldLabel>
                <BannerUpload visual={pageBanner} onUpload={onUploadPageBanner} aspect="aspect-[6/1]" t={t} />
                <FieldHint>{t('about.branding.pageBanner.hint')}</FieldHint>
              </div>
            )}

            <div className="mt-6">
              <FieldLabel>{t('about.branding.cardBanner.title')}</FieldLabel>
              <BannerUpload
                visual={cardBanner}
                onUpload={onUploadCardBanner}
                aspect="aspect-video"
                widthClass="max-w-[260px]"
                t={t}
              />
              <FieldHint>{t('about.branding.cardBanner.hint')}</FieldHint>
            </div>
          </div>

          <Separator />

          {/* What */}
          <FieldSection>
            <FieldLabel>{t('about.what.title')}</FieldLabel>
            <MarkdownEditor
              value={what}
              onChange={next => onChange({ what: next })}
              placeholder="What's this space about…"
              className="mt-2"
            />
            <FieldFooter
              hint={t('about.what.description')}
              dirty={!!dirtyByField.what}
              status={saveStatusByField.what ?? { kind: 'idle' }}
              onSave={() => onSaveSection('what')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Why */}
          <FieldSection>
            <FieldLabel>{t('about.why.title')}</FieldLabel>
            <MarkdownEditor
              value={why}
              onChange={next => onChange({ why: next })}
              placeholder="Why does this space exist…"
              className="mt-2"
            />
            <FieldFooter
              hint={t('about.why.description')}
              dirty={!!dirtyByField.why}
              status={saveStatusByField.why ?? { kind: 'idle' }}
              onSave={() => onSaveSection('why')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Who */}
          <FieldSection>
            <FieldLabel>{t('about.who.title')}</FieldLabel>
            <MarkdownEditor
              value={who}
              onChange={next => onChange({ who: next })}
              placeholder="Who is this space for…"
              className="mt-2"
            />
            <FieldFooter
              hint={t('about.who.description')}
              dirty={!!dirtyByField.who}
              status={saveStatusByField.who ?? { kind: 'idle' }}
              onSave={() => onSaveSection('who')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Location */}
          <FieldSection>
            <FieldLabel>{t('about.location.title')}</FieldLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">
              <InlineEditText
                value={city}
                onChange={next => onChange({ city: next })}
                ariaLabel="City"
                editAriaLabel="Edit city"
                placeholder="City"
              />
              <CountryCombobox
                value={country}
                onChange={next => onChange({ country: next })}
                countries={props.countries}
                placeholder="Country"
                className="w-full"
              />
            </div>
            <FieldFooter
              hint={t('about.location.description')}
              dirty={!!dirtyByField.location}
              status={saveStatusByField.location ?? { kind: 'idle' }}
              onSave={() => onSaveSection('location')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* Tags */}
          <FieldSection>
            <FieldLabel>{t('about.tags.title')}</FieldLabel>
            <TagsInput
              value={tags}
              onChange={next => onChange({ tags: next })}
              placeholder="Add a tag and press Enter"
              className="mt-2"
            />
            <FieldFooter
              hint={t('about.tags.description')}
              dirty={!!dirtyByField.tags}
              status={saveStatusByField.tags ?? { kind: 'idle' }}
              onSave={() => onSaveSection('tags')}
              t={t}
            />
          </FieldSection>

          <Separator />

          {/* References */}
          <FieldSection>
            <div className="flex items-center justify-between">
              <FieldLabel>{t('about.references.title')}</FieldLabel>
              <Button type="button" variant="outline" size="sm" onClick={onAddReference}>
                <Plus aria-hidden="true" className="mr-1.5 size-3.5" />
                {t('about.references.add')}
              </Button>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              {references.length === 0 && (
                <p className="text-sm text-muted-foreground italic">{t('about.references.empty')}</p>
              )}
              {references.map(ref => (
                <ReferenceRow
                  key={ref.id}
                  reference={ref}
                  onPatch={patch => onUpdateReference(ref.id, patch)}
                  onRemove={() => onRemoveReference(ref.id)}
                />
              ))}
            </div>
            <FieldFooter
              hint={t('about.references.description')}
              dirty={!!dirtyByField.references}
              status={saveStatusByField.references ?? { kind: 'idle' }}
              onSave={() => onSaveSection('references')}
              t={t}
            />
          </FieldSection>
        </div>

        {/* Preview */}
        <div className="hidden min-w-0 lg:block">
          <div className="sticky top-6">
            <p className="text-label uppercase text-muted-foreground mb-3">{t('about.preview.label')}</p>
            <SpaceCard space={previewCardToSpaceCardData(previewCard)} />
            {/* Live Preview info */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 px-5 py-4">
              <span className="mt-0.5 text-muted-foreground">ⓘ</span>
              <div>
                <p className="text-card-title text-foreground">{t('about.preview.livePreview.title')}</p>
                <p className="text-body text-muted-foreground mt-1">{t('about.preview.livePreview.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function previewCardToSpaceCardData(preview: SpaceCardPreview): SpaceCardData {
  return {
    id: preview.href || 'preview',
    name: preview.name,
    description: preview.tagline,
    bannerImageUrl: preview.bannerUrl ?? undefined,
    avatarUrl: preview.avatarUrl ?? undefined,
    initials: preview.initials,
    avatarColor: preview.color,
    isPrivate: false,
    tags: preview.tags,
    leads: [],
    href: preview.href,
  };
}

function FieldSection({ children }: { children: React.ReactNode }) {
  return <div className="py-6">{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-card-title">{children}</h3>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-caption text-muted-foreground">{children}</p>;
}

type TFn = ReturnType<typeof useTranslation<'crd-spaceSettings'>>['t'];

function FieldFooter({
  hint,
  dirty,
  status,
  onSave,
  t,
}: {
  hint: string;
  dirty: boolean;
  status: AboutSectionSaveStatus;
  onSave: () => void;
  t: TFn;
}) {
  return (
    <div className="mt-1.5 flex items-start justify-between gap-3">
      <p className="text-xs text-muted-foreground">{hint}</p>
      <InlineSaveButton dirty={dirty} status={status} onSave={onSave} t={t} />
    </div>
  );
}

function InlineSaveButton({
  dirty,
  status,
  onSave,
  t,
}: {
  dirty: boolean;
  status: AboutSectionSaveStatus;
  onSave: () => void;
  t: TFn;
}) {
  if (status.kind === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-3 animate-spin" />
        {t('about.inlineSave.saving')}
      </span>
    );
  }
  if (status.kind === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Check aria-hidden="true" className="size-3" />
        {t('about.inlineSave.saved')}
      </span>
    );
  }
  if (status.kind === 'error') {
    return (
      <button type="button" onClick={onSave} className="text-caption font-semibold text-destructive hover:underline">
        {t('about.inlineSave.retry')}
      </button>
    );
  }
  if (!dirty) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      className="text-caption font-semibold text-foreground px-2 py-0.5 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {t('about.inlineSave.save')}
    </button>
  );
}

function BannerUpload({
  visual,
  onUpload,
  aspect,
  widthClass,
  t,
}: {
  visual: AboutVisual;
  onUpload: (file: File) => void;
  aspect: string;
  widthClass?: string;
  t: TFn;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (e.target) e.target.value = '';
  };
  return (
    <div className={cn('group relative mt-2 overflow-hidden rounded-md', aspect, widthClass ?? 'w-full')}>
      {visual.uri ? (
        <>
          <img src={visual.uri} alt={visual.altText ?? ''} className="h-full w-full object-cover" />
          {/* Touch devices have no hover, so the change action is always visible on mobile;
              on md+ it fades in only on hover or keyboard focus to keep the image readable. */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} className="shadow-lg">
              <ImageIcon aria-hidden="true" className="mr-2 size-4" />
              {t('about.branding.changeBanner')}
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full items-center justify-center border border-dashed rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <ImageIcon aria-hidden="true" className="mr-2 size-4" />
          <span className="text-sm">{t('about.branding.upload')}</span>
        </button>
      )}
      <input ref={inputRef} id={inputId} type="file" accept="image/*" className="hidden" onChange={handlePick} />
    </div>
  );
}

function ReferenceRow({
  reference,
  onPatch,
  onRemove,
}: {
  reference: AboutReference;
  onPatch: (patch: Partial<Omit<AboutReference, 'id'>>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-3 pt-3">
        <InlineEditText
          value={reference.title}
          onChange={next => onPatch({ title: next })}
          ariaLabel="Reference title"
          editAriaLabel="Edit title"
          placeholder="Title (required)"
          error={!reference.title.trim() ? 'Title is required' : undefined}
          className="flex-1 font-medium"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove reference">
          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
        </Button>
      </div>
      <Separator className="my-1 opacity-30" />
      <div className="px-3">
        <InlineEditText
          value={reference.uri}
          onChange={next => onPatch({ uri: ensureHttps(next) })}
          ariaLabel="Reference URL"
          editAriaLabel="Edit URL"
          placeholder="https://…"
          className="text-sm text-muted-foreground"
        />
      </div>
      <Separator className="my-1 opacity-30" />
      <div className="px-3 pb-3">
        <InlineEditText
          value={reference.description}
          onChange={next => onPatch({ description: next })}
          ariaLabel="Reference description"
          editAriaLabel="Edit description"
          placeholder="Description (optional)"
          multiline={true}
          className="text-sm text-muted-foreground"
        />
      </div>
    </div>
  );
}
