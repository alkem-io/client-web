import { CropIcon, FileText, ImageIcon, Link2, MapPin, Plus, Tag, Tags, Type } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassificationEntryCard } from '@/crd/components/classification/ClassificationEntryCard';
import type { ClassificationEntryData } from '@/crd/components/classification/types';
import { CityAutocompleteInput, type CityOption } from '@/crd/components/common/CityAutocompleteInput';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { SpaceCard, type SpaceCardData } from '@/crd/components/space/SpaceCard';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { resolveBannerAspectRatio } from '@/crd/lib/bannerAspectRatio';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import type {
  AboutFormValues,
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
  /** City suggestions; `undefined` until loaded (see `onCityFocus`). */
  cityOptions?: ReadonlyArray<CityOption>;
  /** City input focused — the consumer lazily loads `cityOptions`. */
  onCityFocus?: () => void;
  /** Locks every field while the tab's changes are being saved (spec 045 FR-025d). */
  disabled?: boolean;
  /** Character limits of the markdown sections; each turns on that editor's progress ring. */
  markdownMaxLengthByField?: Partial<Record<'what' | 'why' | 'who', number>>;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  /** Re-crop an already-uploaded visual. */
  onRecropVisual?: (key: 'avatar' | 'pageBanner' | 'cardBanner') => void;
  /** Replace the whole references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — passed through to the shared editor. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;
  /** New references that have a URL or description but no title — flagged, and they block Save. */
  untitledReferenceIds?: string[];
  className?: string;

  // ── Classifications (D1) — staged with the rest of the tab and saved by the unsaved-changes bar ──
  classifications: ClassificationEntryData[];
  /** Entries added locally and not saved yet — marked "Unsaved". */
  unsavedClassificationIds: string[];
  /** Step A — opens the template picker (owned by the connector). */
  onAddClassification: () => void;
  /** Step B — full-replacement selection write. */
  onSelectClassificationValues: (entryId: string, selectedValueIDs: string[]) => void;
  /** The shown/hidden toggle (FR-010b/FR-010d) — worded "not shown on the Space page", never "private". */
  onToggleClassificationDisplay: (entryId: string, display: boolean) => void;
  /** Stages the removal — undone by Discard, so there is no confirmation. */
  onRemoveClassification: (entryId: string) => void;
} & MarkdownUploadProps;

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
    previewCard,
    disabled = false,
    markdownMaxLengthByField,
    onChange,
    onUploadAvatar,
    onUploadPageBanner,
    onUploadCardBanner,
    onRecropVisual,
    onReferencesChange,
    onReferenceFileUpload,
    referenceUploadAccept,
    untitledReferenceIds = [],
    className,
    onImageUpload,
    iframeAllowedUrls,
    onError,
    classifications,
    unsavedClassificationIds,
    onAddClassification,
    onSelectClassificationValues,
    onToggleClassificationDisplay,
    onRemoveClassification,
  } = props;
  // Canonical visual fields (see spec 100-space-header-layout § "Visual fields — canonical usage"):
  //   - L0: page banner + cardBanner only — L0 has NO avatar concept (L0 cards show title + cardBanner)
  //   - L1/L2: avatar + cardBanner — L1/L2 have NO settable page banner (they inherit L0 root's)
  const showPageBanner = level === 'L0';
  const showAvatar = level !== 'L0';
  // FR-042: subspace copy via the i18next `_subspace` key variants.
  const context = level === 'L0' ? undefined : 'subspace';
  const nameId = useId();
  const taglineId = useId();
  const cityId = useId();

  // The shape is chosen in the crop dialog, not here — this only sizes the
  // preview box to whatever the visual currently is (default shape until an
  // image has actually been cropped).
  const pageBannerRatio = resolveBannerAspectRatio(pageBanner);

  return (
    <div className={cn('grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]', className)}>
      <div inert={disabled} aria-busy={disabled} className="flex min-w-0 flex-col gap-5">
        <SettingsSection title={t('about.sections.identity')} icon={<Type className="size-4" />} iconColor="blue">
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor={nameId}>{t('about.name.title', { context })}</FieldLabel>
              <Input
                id={nameId}
                value={name}
                onChange={e => onChange({ name: e.target.value })}
                placeholder={t('about.name.title', { context })}
                className="mt-2"
              />
              <FieldHint>{t('about.name.description', { context })}</FieldHint>
            </div>
            <div>
              <FieldLabel htmlFor={taglineId}>{t('about.tagline.title')}</FieldLabel>
              <Input
                id={taglineId}
                value={tagline}
                onChange={e => onChange({ tagline: e.target.value })}
                placeholder={t('about.tagline.title')}
                className="mt-2"
              />
              <FieldHint>{t('about.tagline.description', { context })}</FieldHint>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          defaultOpen={false}
          title={t('about.sections.visuals')}
          icon={<ImageIcon className="size-4" />}
          iconColor="purple"
        >
          {/* One row of true shapes (stacked on narrow screens): avatar (L1/L2) → card banner → page banner (L0, fills the rest). */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {showAvatar && (
              <div className="w-40 shrink-0">
                <FieldLabel>{t('about.branding.avatar.title')}</FieldLabel>
                <BannerUpload
                  visual={avatar}
                  onUpload={onUploadAvatar}
                  aspectRatio={1}
                  t={t}
                  onRecrop={() => onRecropVisual?.('avatar')}
                  recropLabel={t('about.branding.avatar.recrop')}
                  uploadLabel={t('about.branding.avatar.upload')}
                  sizeLabel={t('about.branding.avatar.size')}
                />
                <FieldHint>{t('about.branding.avatar.hint', { context })}</FieldHint>
              </div>
            )}

            <div className="w-full max-w-[260px] shrink-0">
              <FieldLabel>{t('about.branding.cardBanner.title')}</FieldLabel>
              <BannerUpload
                visual={cardBanner}
                onUpload={onUploadCardBanner}
                aspectRatio={1.6}
                t={t}
                onRecrop={() => onRecropVisual?.('cardBanner')}
                recropLabel={t('about.branding.cardBanner.recrop')}
                uploadLabel={t('about.branding.cardBanner.upload')}
                sizeLabel={t('about.branding.cardBanner.size')}
              />
              <FieldHint>{t('about.branding.cardBanner.hint', { context })}</FieldHint>
            </div>

            {showPageBanner && (
              <div className="min-w-0 flex-1">
                <FieldLabel>{t('about.branding.pageBanner.title')}</FieldLabel>
                <BannerUpload
                  visual={pageBanner}
                  onUpload={onUploadPageBanner}
                  aspectRatio={pageBannerRatio}
                  fit="contain"
                  t={t}
                  onRecrop={() => onRecropVisual?.('pageBanner')}
                  recropLabel={t('about.branding.pageBanner.recrop')}
                  uploadLabel={t('about.branding.pageBanner.upload')}
                  sizeLabel={t('about.branding.pageBanner.size')}
                />
                <FieldHint>{t('about.branding.pageBanner.hint')}</FieldHint>
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          defaultOpen={false}
          title={t('about.location.title')}
          icon={<MapPin className="size-4" />}
          iconColor="green"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor={cityId}>{t('about.location.city')}</FieldLabel>
              <CityAutocompleteInput
                id={cityId}
                value={city}
                onChange={next => onChange({ city: next })}
                onSelect={option => onChange({ city: option.name, country: option.countryCode })}
                options={props.cityOptions}
                onFocus={props.onCityFocus}
                placeholder={t('about.location.city')}
                className="mt-2"
              />
            </div>
            <div>
              <FieldLabel>{t('about.location.countryPlaceholder')}</FieldLabel>
              <CountryCombobox
                value={country}
                onChange={next => onChange({ country: next })}
                countries={props.countries}
                placeholder={t('about.location.countryPlaceholder')}
                className="mt-2 w-full bg-input-background"
              />
            </div>
          </div>
          <FieldHint>{t('about.location.description', { context })}</FieldHint>
        </SettingsSection>

        <SettingsSection
          defaultOpen={false}
          id="description"
          title={t('about.sections.context')}
          icon={<FileText className="size-4" />}
          iconColor="orange"
        >
          <div className="space-y-6">
            {(['what', 'why', 'who'] as const).map(field => (
              <div key={field} id={field === 'what' ? undefined : field} className="scroll-mt-32">
                <FieldLabel>{t(`about.${field}.title`)}</FieldLabel>
                <div className="mt-2">
                  <MarkdownEditor
                    value={props[field]}
                    onChange={next => onChange({ [field]: next })}
                    maxLength={markdownMaxLengthByField?.[field]}
                    placeholder={t(`about.${field}.placeholder`, { context })}
                    onImageUpload={onImageUpload}
                    iframeAllowedUrls={iframeAllowedUrls}
                    onError={onError}
                  />
                </div>
                <FieldHint>{t(`about.${field}.description`, { context })}</FieldHint>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          defaultOpen={false}
          title={t('about.tags.title')}
          icon={<Tag className="size-4" />}
          iconColor="amber"
        >
          <TagsInput
            value={tags}
            onChange={next => onChange({ tags: next })}
            placeholder={t('about.tags.placeholder')}
          />
          <FieldHint>{t('about.tags.description', { context })}</FieldHint>
        </SettingsSection>

        {/* Classifications (D1, product#2161 design 01) */}
        <SettingsSection
          defaultOpen={false}
          id="classifications"
          title={t('classifications.sectionTitle')}
          icon={<Tags className="size-4" />}
          iconColor="purple"
        >
          <p className="text-caption text-muted-foreground">{t('classifications.sectionDescription', { context })}</p>
          {classifications.length > 0 && (
            <div className="mt-4 space-y-3">
              {classifications.map(entry => (
                <ClassificationEntryCard
                  key={entry.id}
                  entry={entry}
                  unsaved={unsavedClassificationIds.includes(entry.id)}
                  onSelectValues={onSelectClassificationValues}
                  onToggleDisplay={onToggleClassificationDisplay}
                  onRequestRemove={onRemoveClassification}
                  subspace={level !== 'L0'}
                />
              ))}
            </div>
          )}
          {/* Below the list, per design 01 — Step A entry point. */}
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onAddClassification}>
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            {t('classifications.addButton')}
          </Button>
        </SettingsSection>

        <SettingsSection
          defaultOpen={false}
          id="references"
          title={t('about.references.title')}
          icon={<Link2 className="size-4" />}
          iconColor="rose"
        >
          <ReferencesEditor
            hideLabel={true}
            rows={references.map(r => ({ id: r.id, name: r.title, uri: r.uri, description: r.description }))}
            onChange={onReferencesChange}
            onFileUpload={onReferenceFileUpload}
            uploadAccept={referenceUploadAccept}
            errors={Object.fromEntries(
              references.flatMap((r, index) =>
                untitledReferenceIds.includes(r.id) ? [[`${index}.name`, t('about.references.titleRequired')]] : []
              )
            )}
          />
          <FieldHint>{t('about.references.description', { context })}</FieldHint>
        </SettingsSection>
      </div>

      {/* Preview */}
      <div className="hidden min-w-0 xl:block">
        <div className="sticky top-32">
          <p className="text-label uppercase text-muted-foreground mb-3">{t('about.preview.label')}</p>
          <SpaceCard space={previewCardToSpaceCardData(previewCard, level)} />
          {/* Live Preview info */}
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 px-5 py-4">
            <span className="mt-0.5 text-muted-foreground">ⓘ</span>
            <div>
              <p className="text-card-title text-foreground">{t('about.preview.livePreview.title')}</p>
              <p className="text-body text-muted-foreground mt-1">
                {t('about.preview.livePreview.description', { context })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function previewCardToSpaceCardData(preview: SpaceCardPreview, level: SpaceSettingsLevel): SpaceCardData {
  const isL0 = level === 'L0';
  return {
    id: preview.href || 'preview',
    name: preview.name,
    description: preview.tagline,
    bannerImageUrl: preview.bannerUrl ?? undefined,
    // L0 cards have no avatar (per canonical visual-fields rule).
    avatarUrl: isL0 ? undefined : (preview.avatarUrl ?? undefined),
    initials: preview.initials,
    avatarColor: preview.color,
    hideAvatar: isL0,
    isPrivate: false,
    tags: preview.tags,
    leads: [],
    href: preview.href,
  };
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return htmlFor ? (
    <Label htmlFor={htmlFor}>{children}</Label>
  ) : (
    <h4 className="text-body-emphasis leading-none">{children}</h4>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-caption text-muted-foreground">{children}</p>;
}

type TFn = ReturnType<typeof useTranslation<'crd-spaceSettings'>>['t'];

function BannerUpload({
  visual,
  onUpload,
  aspectRatio,
  fit = 'cover',
  widthClass,
  t,
  onRecrop,
  recropLabel,
  uploadLabel,
  sizeLabel,
}: {
  visual: AboutVisual;
  onUpload: (file: File) => void;
  /** Must match how the page that displays this visual renders it, or the
   *  preview lies: the page banner is `object-contain` (never cropped), so a
   *  `cover` preview would show the admin a crop the page does not apply and
   *  invite them to re-crop a banner that was rendering fine. */
  fit?: 'cover' | 'contain';
  /** Numeric width / height. Inline rather than an `aspect-[x/y]` class because
   *  the page banner's value is chosen at runtime and Tailwind's JIT scanner
   *  needs class literals at build time. */
  aspectRatio: number;
  widthClass?: string;
  t: TFn;
  /** Trigger re-cropping of an existing visual. */
  onRecrop?: () => void;
  /** Accessible name + tooltip for the re-crop button, named per visual by the caller. */
  recropLabel?: string;
  /** Accessible name of the empty upload tile, named per visual by the caller. */
  uploadLabel: string;
  /** Recommended size shown inside the empty upload tile, e.g. "416 × 256px". */
  sizeLabel?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (e.target) e.target.value = '';
  };
  return (
    <div
      // `min-h-14` keeps the box tall enough for the controls it contains. At
      // the widest allowed banner shape (10:1) a full-width settings card on a
      // phone works out under 30px, which clips the "Change banner" label and
      // hides the corner crop button entirely — the controls would disappear at
      // exactly the shapes this feature exists to offer.
      className={cn('group relative mt-2 min-h-14 overflow-hidden rounded-md', widthClass ?? 'w-full')}
      style={{ aspectRatio }}
    >
      {visual.uri ? (
        <>
          <img
            src={visual.uri}
            alt={visual.altText ?? ''}
            className={cn('h-full w-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
          />
          {/* Touch devices have no hover, so the change action is always visible on mobile;
              on md+ it fades in only on hover or keyboard focus to keep the image readable. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} className="shadow-lg">
              <ImageIcon aria-hidden="true" className="mr-2 size-4" />
              {t('about.branding.changeBanner')}
            </Button>
          </div>
          {/* Re-crop sits outside the hover overlay, pinned to the corner: it acts
              on the image already there, so it stays reachable (and its tooltip
              usable) rather than being one of two stacked centre buttons. */}
          {onRecrop && recropLabel && (
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={onRecrop}
                  aria-label={recropLabel}
                  className="absolute top-2 right-2 shadow-lg opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                >
                  <CropIcon aria-hidden="true" className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{recropLabel}</TooltipContent>
            </Tooltip>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={uploadLabel}
          className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground transition-colors cursor-pointer hover:border-primary/40 hover:bg-primary/5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ImageIcon aria-hidden="true" className="size-10 text-muted-foreground/50" />
          {sizeLabel && <span className="text-caption text-muted-foreground/70">{sizeLabel}</span>}
        </button>
      )}
      <input ref={inputRef} id={inputId} type="file" accept="image/*" className="hidden" onChange={handlePick} />
    </div>
  );
}
