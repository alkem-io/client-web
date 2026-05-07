import { Briefcase, Image as ImageIcon, Link2, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { type SectionSaveStatus, FieldFooter as SharedFieldFooter } from '@/crd/components/common/FieldFooter';
import { InlineEditText } from '@/crd/components/common/InlineEditText';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { UserProfileReference, UserProfileSectionKey, UserProfileViewProps } from './UserProfileTabView.types';

type RecognizedKind = 'linkedin' | 'bsky' | 'github';

type SectionLabels = {
  save: string;
  saving: string;
  saved: string;
  retry: string;
};

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

export function UserProfileTabView(props: UserProfileViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const {
    values,
    countries,
    loading,
    dirtyByField,
    saveStatusByField,
    onChange,
    onAddReference,
    onUpdateReference,
    onUpdateRecognizedReference,
    onRequestRemoveReference,
    onUploadAvatar,
    onSaveSection,
    pendingReferenceDelete,
    onConfirmRemoveReference,
    onCancelRemoveReference,
    uploadingAvatar,
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

  const status = (k: UserProfileSectionKey): SectionSaveStatus => saveStatusByField[k] ?? { kind: 'idle' };
  const dirty = (k: UserProfileSectionKey): boolean => Boolean(dirtyByField[k]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {/* Identity */}
        <SettingsCard icon={UserIcon} title={t('user.profile.identity.title')}>
          <SingleFieldSection
            label={t('user.profile.identity.displayName.label')}
            hint={t('user.profile.identity.displayName.hint')}
            inputAriaLabel={t('user.profile.identity.displayName.label')}
            placeholder={t('user.profile.identity.displayName.label')}
            value={values.displayName}
            required={true}
            requiredError={t('user.profile.identity.displayName.required')}
            onChange={next => onChange({ displayName: next })}
            dirty={dirty('displayName')}
            status={status('displayName')}
            onSave={() => onSaveSection('displayName')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <SingleFieldSection
            label={t('user.profile.identity.firstName.label')}
            hint={t('user.profile.identity.firstName.hint')}
            inputAriaLabel={t('user.profile.identity.firstName.label')}
            placeholder={t('user.profile.identity.firstName.label')}
            value={values.firstName}
            required={true}
            requiredError={t('user.profile.identity.firstName.required')}
            onChange={next => onChange({ firstName: next })}
            dirty={dirty('firstName')}
            status={status('firstName')}
            onSave={() => onSaveSection('firstName')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <SingleFieldSection
            label={t('user.profile.identity.lastName.label')}
            hint={t('user.profile.identity.lastName.hint')}
            inputAriaLabel={t('user.profile.identity.lastName.label')}
            placeholder={t('user.profile.identity.lastName.label')}
            value={values.lastName}
            required={true}
            requiredError={t('user.profile.identity.lastName.required')}
            onChange={next => onChange({ lastName: next })}
            dirty={dirty('lastName')}
            status={status('lastName')}
            onSave={() => onSaveSection('lastName')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <ReadOnlyEmailSection
            label={t('user.profile.identity.email.label')}
            value={values.email}
            caption={t('user.profile.identity.email.readOnlyCaption')}
          />
          <Separator className="my-4 opacity-50" />
          <PhoneSection
            label={t('user.profile.identity.phone.label')}
            hint={t('user.profile.identity.phone.hint')}
            invalidMsg={t('user.profile.identity.phone.invalidFormat')}
            value={values.phone}
            onChange={next => onChange({ phone: next })}
            dirty={dirty('phone')}
            status={status('phone')}
            onSave={() => onSaveSection('phone')}
            labels={labels}
          />
        </SettingsCard>

        {/* About You */}
        <SettingsCard icon={UserIcon} title={t('user.profile.aboutYou.title')}>
          <SingleFieldSection
            label={t('user.profile.aboutYou.tagline.label')}
            hint={t('user.profile.aboutYou.tagline.hint')}
            inputAriaLabel={t('user.profile.aboutYou.tagline.label')}
            placeholder={t('user.profile.aboutYou.tagline.label')}
            value={values.tagline}
            onChange={next => onChange({ tagline: next })}
            dirty={dirty('tagline')}
            status={status('tagline')}
            onSave={() => onSaveSection('tagline')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <LocationSection
            title={t('user.profile.aboutYou.location.title')}
            cityLabel={t('user.profile.aboutYou.location.city')}
            countryLabel={t('user.profile.aboutYou.location.country')}
            countryPlaceholder={t('user.profile.aboutYou.location.countryPlaceholder')}
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
          <BioSection
            label={t('user.profile.aboutYou.bio.label')}
            hint={t('user.profile.aboutYou.bio.hint')}
            value={values.bio}
            onChange={next => onChange({ bio: next })}
            dirty={dirty('bio')}
            status={status('bio')}
            onSave={() => onSaveSection('bio')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <TagsSection
            label={t('user.profile.aboutYou.tags.label')}
            hint={t('user.profile.aboutYou.tags.hint')}
            value={values.tags}
            onChange={next => onChange({ tags: next })}
            dirty={dirty('tags')}
            status={status('tags')}
            onSave={() => onSaveSection('tags')}
            labels={labels}
          />
        </SettingsCard>

        {/* Social Links / References */}
        <SettingsCard icon={Link2} title={t('user.profile.socialLinks.title')}>
          <RecognizedReferenceRow
            kind="linkedin"
            placeholder={t('user.profile.socialLinks.linkedinPlaceholder')}
            value={values.recognizedReferences.linkedin?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('linkedin', uri)}
          />
          <Separator className="my-3 opacity-30" />
          <RecognizedReferenceRow
            kind="bsky"
            placeholder={t('user.profile.socialLinks.bskyPlaceholder')}
            value={values.recognizedReferences.bsky?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('bsky', uri)}
          />
          <Separator className="my-3 opacity-30" />
          <RecognizedReferenceRow
            kind="github"
            placeholder={t('user.profile.socialLinks.githubPlaceholder')}
            value={values.recognizedReferences.github?.uri ?? ''}
            onUriChange={uri => onUpdateRecognizedReference('github', uri)}
          />

          {values.references.length > 0 ? <Separator className="my-4" /> : null}
          <div className="space-y-3">
            {values.references.map(ref => (
              <ArbitraryReferenceRow
                key={ref.id}
                reference={ref}
                onPatch={patch => onUpdateReference(ref.id, patch)}
                onRemove={() => onRequestRemoveReference(ref.id)}
                namePlaceholder={t('user.profile.socialLinks.namePlaceholder')}
                urlPlaceholder={t('user.profile.socialLinks.urlPlaceholder')}
                descriptionPlaceholder={t('user.profile.socialLinks.descriptionPlaceholder')}
              />
            ))}
          </div>

          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" onClick={onAddReference}>
              <Plus aria-hidden="true" className="mr-2 size-4" />
              {t('user.profile.socialLinks.addAnother')}
            </Button>
          </div>

          <FF
            dirty={dirty('references')}
            status={status('references')}
            onSave={() => onSaveSection('references')}
            labels={labels}
          />
        </SettingsCard>
      </div>

      {/* Avatar column */}
      <SettingsCard icon={ImageIcon} title={t('user.profile.avatar.title')}>
        <AvatarColumn
          avatarUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName || values.firstName || values.email}
          tagline={values.tagline}
          uploading={uploadingAvatar}
          uploadHelperText={t('user.profile.avatar.helperText')}
          changeButtonLabel={t('user.profile.avatar.changeButton')}
          uploadingLabel={t('user.profile.avatar.uploading')}
          onAvatarFilePicked={onUploadAvatar}
        />
      </SettingsCard>

      <ConfirmationDialog
        open={Boolean(pendingReferenceDelete)}
        onOpenChange={open => {
          if (!open) onCancelRemoveReference();
        }}
        title={t('user.profile.socialLinks.deleteDialog.title')}
        description={t('user.profile.socialLinks.deleteDialog.description')}
        confirmLabel={t('user.profile.socialLinks.deleteDialog.confirm')}
        variant="destructive"
        onConfirm={onConfirmRemoveReference}
        onCancel={onCancelRemoveReference}
      />
    </div>
  );
}

// ────────────────── Sub-components ──────────────────

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
}: SingleFieldSectionProps) {
  const isEmpty = required && !value.trim();
  const showError = isEmpty && status.kind === 'error' && requiredError;
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
          error={showError ? requiredError : undefined}
        />
      </div>
      <FF hint={hint} dirty={dirty} status={status} onSave={onSave} labels={labels} />
    </div>
  );
}

function ReadOnlyEmailSection({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 text-body text-muted-foreground">{value || '—'}</p>
      <p className="mt-1.5 text-caption text-muted-foreground">{caption}</p>
    </div>
  );
}

type PhoneSectionProps = {
  label: string;
  hint: string;
  invalidMsg: string;
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

function PhoneSection({ label, hint, invalidMsg, value, onChange, dirty, status, onSave, labels }: PhoneSectionProps) {
  const isInvalid = value.trim() !== '' && !PHONE_REGEX.test(value);
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2">
        <InlineEditText
          value={value}
          onChange={onChange}
          ariaLabel={label}
          editAriaLabel={label}
          placeholder={label}
          error={isInvalid ? invalidMsg : undefined}
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

type BioSectionProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

function BioSection(p: BioSectionProps) {
  return (
    <div>
      <SectionLabel>{p.label}</SectionLabel>
      <div className="mt-2">
        <MarkdownEditor value={p.value} onChange={p.onChange} />
      </div>
      <FF hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </div>
  );
}

type TagsSectionProps = {
  label: string;
  hint: string;
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
        <TagsInput value={p.value} onChange={p.onChange} placeholder={p.hint} />
      </div>
      <FF hint={p.hint} dirty={p.dirty} status={p.status} onSave={p.onSave} labels={p.labels} />
    </div>
  );
}

// Lucide does not ship brand icons for LinkedIn / Bluesky / GitHub in the
// version pinned to this repo. Use a neutral link tile + the recognized
// brand label below — same UX shape as the existing MUI `SocialSegment`.
const RECOGNIZED_ICON: Record<RecognizedKind, typeof Link2> = {
  linkedin: Link2,
  bsky: Briefcase,
  github: Link2,
};

const RECOGNIZED_LABEL: Record<RecognizedKind, string> = {
  linkedin: 'LinkedIn',
  bsky: 'Bluesky',
  github: 'GitHub',
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
  const Icon = RECOGNIZED_ICON[kind];
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <div className="flex-1">
        <Label className="text-caption text-muted-foreground">{RECOGNIZED_LABEL[kind]}</Label>
        <Input
          className="mt-1"
          value={value}
          onChange={e => onUriChange(e.target.value)}
          placeholder={placeholder}
          aria-label={RECOGNIZED_LABEL[kind]}
        />
      </div>
    </div>
  );
}

function ArbitraryReferenceRow({
  reference,
  onPatch,
  onRemove,
  namePlaceholder,
  urlPlaceholder,
  descriptionPlaceholder,
}: {
  reference: UserProfileReference;
  onPatch: (patch: Partial<Omit<UserProfileReference, 'id' | 'recognized'>>) => void;
  onRemove: () => void;
  namePlaceholder: string;
  urlPlaceholder: string;
  descriptionPlaceholder: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={reference.name}
          onChange={e => onPatch({ name: e.target.value })}
          placeholder={namePlaceholder}
          aria-label={namePlaceholder}
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={namePlaceholder}>
          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
        </Button>
      </div>
      <Input
        value={reference.uri}
        onChange={e => onPatch({ uri: e.target.value })}
        placeholder={urlPlaceholder}
        aria-label={urlPlaceholder}
        className="mt-2"
      />
      <Input
        value={reference.description}
        onChange={e => onPatch({ description: e.target.value })}
        placeholder={descriptionPlaceholder}
        aria-label={descriptionPlaceholder}
        className="mt-2"
      />
    </div>
  );
}

function AvatarColumn({
  avatarUrl,
  displayName,
  tagline,
  uploading,
  uploadHelperText,
  changeButtonLabel,
  uploadingLabel,
  onAvatarFilePicked,
}: {
  avatarUrl?: string;
  displayName: string;
  tagline?: string;
  uploading: boolean;
  uploadHelperText: string;
  changeButtonLabel: string;
  uploadingLabel: string;
  onAvatarFilePicked: (file: File) => void;
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
      <Avatar className="size-32">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-section-title">
          {(displayName || '??').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="mt-3 text-card-title">{displayName}</p>
      {tagline ? <p className="text-caption text-muted-foreground">{tagline}</p> : null}
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
