import { Building2, Image as ImageIcon, Link2, Mail } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { type SectionSaveStatus, FieldFooter as SharedFieldFooter } from '@/crd/components/common/FieldFooter';
import { InlineEditText } from '@/crd/components/common/InlineEditText';
import BlueSkyIcon from '@/crd/components/common/icons/social/BlueSky.svg?react';
import GitHubIcon from '@/crd/components/common/icons/social/GitHub.svg?react';
import LinkedInIcon from '@/crd/components/common/icons/social/LinkedIn.svg?react';
import { type OrgVerificationStatus, OrgVerifiedBadge } from '@/crd/components/contributor/settings/OrgVerifiedBadge';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type OrgProfileSectionKey =
  | 'displayName'
  | 'tagline'
  | 'description'
  | 'location'
  | 'keywords'
  | 'capabilities'
  | 'contactEmail'
  | 'domain'
  | 'legalEntityName'
  | 'website'
  | 'references';

export type OrgProfileVisualData = {
  id: string;
  uri: string | null;
  altText: string | null;
};

export type OrgProfileReferenceData = {
  id: string;
  name: string;
  uri: string;
  description: string;
  recognized: boolean;
};

export type OrgProfileTagsetData = {
  id?: string;
  tags: string[];
};

export type OrgProfileFormValuesData = {
  profileId: string;
  organizationId: string;
  nameID: string;
  displayName: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  keywords: OrgProfileTagsetData;
  capabilities: OrgProfileTagsetData;
  contactEmail: string;
  domain: string;
  legalEntityName: string;
  website: string;
  avatar: OrgProfileVisualData;
  references: OrgProfileReferenceData[];
  recognizedReferences: {
    linkedin: OrgProfileReferenceData | null;
    bsky: OrgProfileReferenceData | null;
    github: OrgProfileReferenceData | null;
  };
  verifiedStatus: OrgVerificationStatus;
};

export type OrgProfileCountryOption = { code: string; name: string };

export type OrgProfileViewProps = {
  values: OrgProfileFormValuesData;
  countries: ReadonlyArray<OrgProfileCountryOption>;
  loading: boolean;
  dirtyByField: Partial<Record<OrgProfileSectionKey, boolean>>;
  saveStatusByField: Partial<Record<OrgProfileSectionKey, SectionSaveStatus>>;
  onChange: (patch: Partial<OrgProfileFormValuesData>) => void;
  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — passed through to the shared editor. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;
  onSaveSection: (section: OrgProfileSectionKey) => void;
} & MarkdownUploadProps;

type SectionLabels = { save: string; saving: string; saved: string; retry: string };

type FFProps = {
  hint?: string;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

const FF = (p: FFProps) => (
  <SharedFieldFooter hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
);

/**
 * Org Profile tab — presentational view. Mirrors `UserProfileTabView` and
 * the per-section save model (045 About / FR-090) with org-specific
 * fields:
 *
 * - **Identity** — Display Name (required), Name ID (read-only), Tagline.
 * - **About** — Description (markdown), Location (city + country
 *   compound), Keywords (own per-section save), Capabilities (own
 *   per-section save).
 * - **Contact & Legal** — Contact Email (validated), Domain, Legal Entity
 *   Name, Website (validated URL).
 * - **Social Links / References** — LinkedIn / Bluesky / GitHub
 *   recognized rows + arbitrary references list (single section save
 *   batched on click).
 *
 * Verified badge rendered alongside the avatar / logo column (Decision
 * #12 / FR-094 — read-only, no edit affordance).
 */
export function OrgProfileTabView(props: OrgProfileViewProps) {
  const { t } = useTranslation(NS);
  const {
    values,
    countries,
    loading,
    dirtyByField,
    saveStatusByField,
    onChange,
    onReferencesChange,
    onReferenceFileUpload,
    referenceUploadAccept,
    onUpdateRecognizedReference,
    onUploadAvatar,
    onSaveSection,
    uploadingAvatar,
    onImageUpload,
    iframeAllowedUrls,
    onError,
  } = props;

  const labels: SectionLabels = {
    save: t('shared.save'),
    saving: t('shared.saving'),
    saved: t('shared.saved'),
    retry: t('shared.save'),
  };

  if (loading || !values) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const status = (k: OrgProfileSectionKey): SectionSaveStatus => saveStatusByField[k] ?? { kind: 'idle' };
  const dirty = (k: OrgProfileSectionKey): boolean => Boolean(dirtyByField[k]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {/* Identity — Display Name solo, Name ID read-only, Tagline */}
        <SettingsCard icon={Building2} title={t('org.profile.identity.title')}>
          <SingleFieldSection
            label={t('org.profile.identity.displayName.label')}
            hint={t('org.profile.identity.displayName.hint')}
            inputAriaLabel={t('org.profile.identity.displayName.label')}
            placeholder={t('org.profile.identity.displayName.label')}
            value={values.displayName}
            required={true}
            requiredError={t('org.profile.identity.displayName.required')}
            onChange={next => onChange({ displayName: next })}
            dirty={dirty('displayName')}
            status={status('displayName')}
            onSave={() => onSaveSection('displayName')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <ReadOnlyNameIdSection
            label={t('org.profile.identity.nameID.label')}
            value={values.nameID}
            caption={t('org.profile.identity.nameID.caption')}
          />
          <Separator className="my-4 opacity-50" />
          <SingleFieldSection
            label={t('org.profile.identity.tagline.label')}
            hint={t('org.profile.identity.tagline.hint')}
            inputAriaLabel={t('org.profile.identity.tagline.label')}
            placeholder={t('org.profile.identity.tagline.label')}
            value={values.tagline}
            onChange={next => onChange({ tagline: next })}
            dirty={dirty('tagline')}
            status={status('tagline')}
            onSave={() => onSaveSection('tagline')}
            labels={labels}
          />
        </SettingsCard>

        {/* About — Description, Location, Keywords + Capabilities */}
        <SettingsCard icon={Building2} title={t('org.profile.about.title')}>
          <DescriptionSection
            label={t('org.profile.about.description.label')}
            hint={t('org.profile.about.description.hint')}
            value={values.description}
            onChange={next => onChange({ description: next })}
            dirty={dirty('description')}
            status={status('description')}
            onSave={() => onSaveSection('description')}
            labels={labels}
            onImageUpload={onImageUpload}
            iframeAllowedUrls={iframeAllowedUrls}
            onError={onError}
          />
          <Separator className="my-4 opacity-50" />
          <LocationSection
            title={t('org.profile.about.location.title')}
            cityLabel={t('org.profile.about.location.city')}
            countryLabel={t('org.profile.about.location.country')}
            countryPlaceholder={t('org.profile.about.location.countryPlaceholder')}
            city={values.city}
            country={values.country}
            countries={countries}
            onChange={onChange}
            dirty={dirty('location')}
            status={status('location')}
            onSave={() => onSaveSection('location')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <TagsSection
            label={t('org.profile.about.keywords.label')}
            hint={t('org.profile.about.keywords.hint')}
            placeholder={t('org.profile.about.keywords.placeholder')}
            value={values.keywords.tags}
            onChange={next => onChange({ keywords: { ...values.keywords, tags: next } })}
            dirty={dirty('keywords')}
            status={status('keywords')}
            onSave={() => onSaveSection('keywords')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <TagsSection
            label={t('org.profile.about.capabilities.label')}
            hint={t('org.profile.about.capabilities.hint')}
            placeholder={t('org.profile.about.capabilities.placeholder')}
            value={values.capabilities.tags}
            onChange={next => onChange({ capabilities: { ...values.capabilities, tags: next } })}
            dirty={dirty('capabilities')}
            status={status('capabilities')}
            onSave={() => onSaveSection('capabilities')}
            labels={labels}
          />
        </SettingsCard>

        {/* Contact & Legal */}
        <SettingsCard icon={Mail} title={t('org.profile.contactLegal.title')}>
          <FieldPairRow>
            <SingleFieldSection
              label={t('org.profile.contactLegal.contactEmail.label')}
              hint={t('org.profile.contactLegal.contactEmail.hint')}
              inputAriaLabel={t('org.profile.contactLegal.contactEmail.label')}
              placeholder="contact@example.org"
              value={values.contactEmail}
              onChange={next => onChange({ contactEmail: next })}
              dirty={dirty('contactEmail')}
              status={status('contactEmail')}
              onSave={() => onSaveSection('contactEmail')}
              labels={labels}
              validate={value => isValidEmailOrEmpty(value)}
              invalidMsg={t('org.profile.contactLegal.contactEmail.invalidFormat')}
            />
            <SingleFieldSection
              label={t('org.profile.contactLegal.domain.label')}
              hint={t('org.profile.contactLegal.domain.hint')}
              inputAriaLabel={t('org.profile.contactLegal.domain.label')}
              placeholder="example.org"
              value={values.domain}
              onChange={next => onChange({ domain: next })}
              dirty={dirty('domain')}
              status={status('domain')}
              onSave={() => onSaveSection('domain')}
              labels={labels}
            />
          </FieldPairRow>
          <Separator className="my-4 opacity-50" />
          <FieldPairRow>
            <SingleFieldSection
              label={t('org.profile.contactLegal.legalEntityName.label')}
              hint={t('org.profile.contactLegal.legalEntityName.hint')}
              inputAriaLabel={t('org.profile.contactLegal.legalEntityName.label')}
              placeholder={t('org.profile.contactLegal.legalEntityName.label')}
              value={values.legalEntityName}
              onChange={next => onChange({ legalEntityName: next })}
              dirty={dirty('legalEntityName')}
              status={status('legalEntityName')}
              onSave={() => onSaveSection('legalEntityName')}
              labels={labels}
            />
            <SingleFieldSection
              label={t('org.profile.contactLegal.website.label')}
              hint={t('org.profile.contactLegal.website.hint')}
              inputAriaLabel={t('org.profile.contactLegal.website.label')}
              placeholder="https://example.org"
              value={values.website}
              onChange={next => onChange({ website: next })}
              dirty={dirty('website')}
              status={status('website')}
              onSave={() => onSaveSection('website')}
              labels={labels}
              validate={value => isValidUrlOrEmpty(value)}
              invalidMsg={t('org.profile.contactLegal.website.invalidFormat')}
            />
          </FieldPairRow>
        </SettingsCard>

        {/* Social Links / References */}
        <SettingsCard icon={Link2} title={t('org.profile.socialLinks.title')}>
          <RecognizedReferenceRow
            kind="linkedin"
            placeholder={t('org.profile.socialLinks.linkedinPlaceholder')}
            value={values.recognizedReferences.linkedin?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('linkedin', uri)}
          />
          <Separator className="my-3 opacity-30" />
          <RecognizedReferenceRow
            kind="bsky"
            placeholder={t('org.profile.socialLinks.bskyPlaceholder')}
            value={values.recognizedReferences.bsky?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('bsky', uri)}
          />
          <Separator className="my-3 opacity-30" />
          <RecognizedReferenceRow
            kind="github"
            placeholder={t('org.profile.socialLinks.githubPlaceholder')}
            value={values.recognizedReferences.github?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('github', uri)}
          />

          <Separator className="my-4" />
          <ReferencesEditor
            rows={values.references.map(r => ({ id: r.id, name: r.name, uri: r.uri, description: r.description }))}
            onChange={onReferencesChange}
            onFileUpload={onReferenceFileUpload}
            uploadAccept={referenceUploadAccept}
          />

          <FF
            dirty={dirty('references')}
            status={status('references')}
            onSave={() => onSaveSection('references')}
            labels={labels}
          />
        </SettingsCard>
      </div>

      {/* Logo + Verification column */}
      <SettingsCard icon={ImageIcon} title={t('org.profile.logo.title')}>
        <LogoColumn
          avatarUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName}
          uploading={uploadingAvatar}
          uploadHelperText={t('org.profile.logo.helperText')}
          changeButtonLabel={t('org.profile.logo.changeButton')}
          uploadingLabel={t('org.profile.logo.uploading')}
          onAvatarFilePicked={onUploadAvatar}
          verifiedStatus={values.verifiedStatus}
        />
      </SettingsCard>
    </div>
  );
}

// ────────────────── Sub-components ──────────────────

function FieldPairRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-card-title">{children}</Label>;
}

type SingleFieldSectionProps = {
  label: string;
  hint?: string;
  inputAriaLabel: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  requiredError?: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
  /** Optional live validator. When invalid, Save is suppressed by the FieldFooter. */
  validate?: (value: string) => boolean;
  invalidMsg?: string;
};

function SingleFieldSection({
  label,
  hint,
  inputAriaLabel,
  placeholder,
  value,
  required,
  requiredError,
  onChange,
  dirty,
  status,
  onSave,
  labels,
  validate,
  invalidMsg,
}: SingleFieldSectionProps) {
  const isEmpty = required && !value.trim();
  const showRequiredError = isEmpty && status.kind === 'error' && requiredError;
  const isInvalid = !isEmpty && validate ? !validate(value) : false;
  const errorMsg = showRequiredError ? requiredError : isInvalid && invalidMsg ? invalidMsg : undefined;
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2">
        <InlineEditText
          value={value}
          onChange={onChange}
          ariaLabel={inputAriaLabel}
          editAriaLabel={inputAriaLabel}
          placeholder={placeholder}
          error={errorMsg}
        />
      </div>
      <FF
        hint={hint}
        dirty={dirty && !isInvalid}
        status={isInvalid && status.kind !== 'saving' ? { kind: 'idle' } : status}
        onSave={onSave}
        labels={labels}
      />
    </div>
  );
}

function ReadOnlyNameIdSection({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2">
        <Input value={value} readOnly={true} aria-label={label} className="cursor-not-allowed bg-muted/50 font-mono" />
      </div>
      <p className="mt-1.5 text-caption text-muted-foreground">{caption}</p>
    </div>
  );
}

type LocationSectionProps = {
  title: string;
  cityLabel: string;
  countryLabel: string;
  countryPlaceholder: string;
  city: string;
  country: string;
  countries: ReadonlyArray<{ code: string; name: string }>;
  onChange: (patch: { city?: string; country?: string }) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

function LocationSection(p: LocationSectionProps) {
  return (
    <div>
      <SectionLabel>{p.title}</SectionLabel>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-caption text-muted-foreground">{p.cityLabel}</Label>
          <Input
            className="mt-1"
            value={p.city}
            onChange={e => p.onChange({ city: e.target.value })}
            placeholder={p.cityLabel}
            aria-label={p.cityLabel}
          />
        </div>
        <div>
          <Label className="text-caption text-muted-foreground">{p.countryLabel}</Label>
          <CountryCombobox
            className="mt-1 w-full"
            value={p.country}
            onChange={code => p.onChange({ country: code })}
            countries={p.countries}
            placeholder={p.countryPlaceholder}
          />
        </div>
      </div>
      <FF dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </div>
  );
}

type DescriptionSectionProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
} & MarkdownUploadProps;

function DescriptionSection(p: DescriptionSectionProps) {
  return (
    <div>
      <SectionLabel>{p.label}</SectionLabel>
      <div className="mt-2">
        <MarkdownEditor
          value={p.value}
          onChange={p.onChange}
          onImageUpload={p.onImageUpload}
          iframeAllowedUrls={p.iframeAllowedUrls}
          onError={p.onError}
        />
      </div>
      <FF hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </div>
  );
}

type TagsSectionProps = {
  label: string;
  hint: string;
  placeholder: string;
  value: string[];
  onChange: (next: string[]) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

function TagsSection(p: TagsSectionProps) {
  return (
    <div>
      <SectionLabel>{p.label}</SectionLabel>
      <div className="mt-2">
        <TagsInput value={p.value} onChange={p.onChange} placeholder={p.placeholder} />
      </div>
      <FF hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </div>
  );
}

type RecognizedKind = 'linkedin' | 'bsky' | 'github';

const RECOGNIZED_CONFIG: Record<
  RecognizedKind,
  {
    Icon: typeof LinkedInIcon;
    label: string;
    tileClass: string;
  }
> = {
  linkedin: {
    Icon: LinkedInIcon,
    label: 'LinkedIn',
    tileClass: 'bg-[#0077b5]/10 text-[#0077b5]',
  },
  bsky: {
    Icon: BlueSkyIcon,
    label: 'Bluesky',
    tileClass: 'bg-[#0085ff]/10 text-[#0085ff]',
  },
  github: {
    Icon: GitHubIcon,
    label: 'GitHub',
    tileClass: 'bg-foreground/10 text-foreground',
  },
};

function RecognizedReferenceRow({
  kind,
  placeholder,
  value,
  onUriChange,
}: {
  kind: RecognizedKind;
  placeholder: string;
  value: string;
  onUriChange: (uri: string) => void;
}) {
  const { Icon, label, tileClass } = RECOGNIZED_CONFIG[kind];
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', tileClass)}
      >
        <Icon className="size-5" />
      </div>
      <Input
        className="flex-1"
        value={value}
        onChange={e => onUriChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}

function LogoColumn({
  avatarUrl,
  displayName,
  uploading,
  uploadHelperText,
  changeButtonLabel,
  uploadingLabel,
  onAvatarFilePicked,
  verifiedStatus,
}: {
  avatarUrl?: string;
  displayName: string;
  uploading: boolean;
  uploadHelperText: string;
  changeButtonLabel: string;
  uploadingLabel: string;
  onAvatarFilePicked: (file: File) => void;
  verifiedStatus: OrgVerificationStatus;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarFilePicked(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="size-32 rounded-lg">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" className="object-cover" /> : null}
        <AvatarFallback className="rounded-lg text-section-title">
          {(displayName || '??').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="mt-3 text-card-title">{displayName}</p>
      <div className="mt-2">
        <OrgVerifiedBadge status={verifiedStatus} />
      </div>
      <Button
        type="button"
        variant="outline"
        className={cn('mt-4', uploading && 'opacity-80')}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-busy={uploading}
      >
        {uploading ? uploadingLabel : changeButtonLabel}
      </Button>
      <p className="mt-2 text-caption text-muted-foreground">{uploadHelperText}</p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handlePick}
      />
    </div>
  );
}

// ─── Validation helpers ──────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmailOrEmpty = (value: string): boolean => {
  if (!value.trim()) return true;
  return EMAIL_REGEX.test(value);
};
const isValidUrlOrEmpty = (value: string): boolean => {
  if (!value.trim()) return true;
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
};
