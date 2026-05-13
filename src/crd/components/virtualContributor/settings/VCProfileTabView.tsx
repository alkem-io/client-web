import { Bot, Image as ImageIcon, Info, Link2, Plus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { VcProfileReference, VcProfileSectionKey, VcProfileViewProps } from './VCProfileTabView.types';

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

export function VCProfileTabView(props: VcProfileViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const {
    values,
    loading,
    dirtyByField,
    saveStatusByField,
    onChange,
    onAddReference,
    onUpdateReference,
    onRequestRemoveReference,
    onUploadAvatar,
    onSaveSection,
    pendingReferenceDelete,
    onConfirmRemoveReference,
    onCancelRemoveReference,
    uploadingAvatar,
    metadata,
    footerSlot,
  } = props;

  const labels: SectionLabels = {
    save: t('shared.save'),
    saving: t('shared.saving'),
    saved: t('shared.saved'),
    retry: t('shared.save'),
  };

  if (loading) {
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

  const status = (k: VcProfileSectionKey): SectionSaveStatus => saveStatusByField[k] ?? { kind: 'idle' };
  const dirty = (k: VcProfileSectionKey): boolean => Boolean(dirtyByField[k]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {/* Identity — Display Name, Tagline, Description, Keywords */}
        <SettingsCard icon={Bot} title={t('vc.profile.identity.title')}>
          <SingleFieldSection
            label={t('vc.profile.identity.displayName.label')}
            hint={t('vc.profile.identity.displayName.hint')}
            inputAriaLabel={t('vc.profile.identity.displayName.label')}
            placeholder={t('vc.profile.identity.displayName.label')}
            value={values.displayName}
            required={true}
            requiredError={t('vc.profile.identity.displayName.required')}
            onChange={next => onChange({ displayName: next })}
            dirty={dirty('displayName')}
            status={status('displayName')}
            onSave={() => onSaveSection('displayName')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <SingleFieldSection
            label={t('vc.profile.identity.tagline.label')}
            hint={t('vc.profile.identity.tagline.hint')}
            inputAriaLabel={t('vc.profile.identity.tagline.label')}
            placeholder={t('vc.profile.identity.tagline.label')}
            value={values.tagline}
            onChange={next => onChange({ tagline: next })}
            dirty={dirty('tagline')}
            status={status('tagline')}
            onSave={() => onSaveSection('tagline')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <DescriptionSection
            label={t('vc.profile.identity.description.label')}
            hint={t('vc.profile.identity.description.hint')}
            value={values.description}
            onChange={next => onChange({ description: next })}
            dirty={dirty('description')}
            status={status('description')}
            onSave={() => onSaveSection('description')}
            labels={labels}
          />
          <Separator className="my-4 opacity-50" />
          <TagsSection
            label={t('vc.profile.keywords.label')}
            hint={t('vc.profile.keywords.hint')}
            placeholder={t('vc.profile.keywords.placeholder')}
            value={values.keywords.tags}
            onChange={next => onChange({ keywords: { ...values.keywords, tags: next } })}
            dirty={dirty('keywords')}
            status={status('keywords')}
            onSave={() => onSaveSection('keywords')}
            labels={labels}
          />
        </SettingsCard>

        {/* References (Social Links) */}
        <SettingsCard icon={Link2} title={t('vc.profile.socialLinks.title')}>
          <div className="space-y-3">
            {values.references.map(ref => (
              <ArbitraryReferenceRow
                key={ref.id}
                reference={ref}
                onPatch={patch => onUpdateReference(ref.id, patch)}
                onRemove={() => onRequestRemoveReference(ref.id)}
                namePlaceholder={t('vc.profile.socialLinks.namePlaceholder')}
                urlPlaceholder={t('vc.profile.socialLinks.urlPlaceholder')}
                descriptionPlaceholder={t('vc.profile.socialLinks.descriptionPlaceholder')}
                removeAriaLabel={t('vc.profile.socialLinks.removeAriaLabel')}
              />
            ))}
            {values.references.length === 0 ? (
              <p className="text-caption text-muted-foreground">{t('vc.profile.socialLinks.empty')}</p>
            ) : null}
          </div>

          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" onClick={onAddReference}>
              <Plus aria-hidden="true" className="mr-2 size-4" />
              {t('vc.profile.socialLinks.addAnother')}
            </Button>
          </div>

          <FF
            dirty={dirty('references')}
            status={status('references')}
            onSave={() => onSaveSection('references')}
            labels={labels}
          />
        </SettingsCard>

        {/* Read-only metadata (host + body of knowledge) */}
        {metadata && (metadata.host || metadata.bodyOfKnowledge) ? (
          <SettingsCard icon={Info} title={t('vc.profile.metadata.title')}>
            {metadata.host ? <ReadOnlyMetadataRow row={metadata.host} /> : null}
            {metadata.host && metadata.bodyOfKnowledge ? <Separator className="my-3 opacity-30" /> : null}
            {metadata.bodyOfKnowledge ? <ReadOnlyMetadataRow row={metadata.bodyOfKnowledge} /> : null}
          </SettingsCard>
        ) : null}

        {footerSlot}
      </div>

      {/* Avatar column */}
      <SettingsCard icon={ImageIcon} title={t('vc.profile.avatar.title')}>
        <AvatarColumn
          avatarUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName}
          tagline={values.tagline}
          uploading={uploadingAvatar}
          uploadHelperText={t('vc.profile.avatar.helperText')}
          changeButtonLabel={t('vc.profile.avatar.changeButton')}
          uploadingLabel={t('vc.profile.avatar.uploading')}
          onAvatarFilePicked={onUploadAvatar}
        />
      </SettingsCard>

      <ConfirmationDialog
        open={Boolean(pendingReferenceDelete)}
        onOpenChange={open => {
          if (!open) onCancelRemoveReference();
        }}
        title={t('vc.profile.socialLinks.deleteDialog.title')}
        description={t('vc.profile.socialLinks.deleteDialog.description')}
        confirmLabel={t('vc.profile.socialLinks.deleteDialog.confirm')}
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

type DescriptionSectionProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  labels: SectionLabels;
};

function DescriptionSection(p: DescriptionSectionProps) {
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

function ArbitraryReferenceRow({
  reference,
  onPatch,
  onRemove,
  namePlaceholder,
  urlPlaceholder,
  descriptionPlaceholder,
  removeAriaLabel,
}: {
  reference: VcProfileReference;
  onPatch: (patch: Partial<Omit<VcProfileReference, 'id'>>) => void;
  onRemove: () => void;
  namePlaceholder: string;
  urlPlaceholder: string;
  descriptionPlaceholder: string;
  removeAriaLabel: string;
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
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={removeAriaLabel}>
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

function ReadOnlyMetadataRow({ row }: { row: { label: string; value: string; href?: string } }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-caption text-muted-foreground">{row.label}</Label>
      {row.href ? (
        <a href={row.href} className="text-body-emphasis text-primary underline-offset-4 hover:underline">
          {row.value}
        </a>
      ) : (
        <p className="text-body">{row.value}</p>
      )}
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
