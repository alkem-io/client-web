import { Bookmark, Bot, Image as ImageIcon, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import {
  ProfileFieldBlock,
  ProfileImageCardBody,
  ProfileTextField,
} from '@/crd/components/contributor/settings/ProfileFormFields';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { VcProfileViewProps, VcReadOnlyMetadataRow } from './VCProfileTabView.types';

/**
 * VC Settings → Profile tab. Collapsible sections (only Identity open by
 * default) with boxed inputs — Identity, References and the read-only details
 * — and the avatar card on the right. Every edit goes to the consumer's buffer
 * and is saved through the settings page's unsaved-changes bar (spec 097
 * Session 2026-10-22); only the avatar upload commits immediately.
 */
export function VCProfileTabView(props: VcProfileViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const {
    values,
    loading,
    onChange,
    onReferencesChange,
    onReferenceFileUpload,
    referenceUploadAccept,
    onUploadAvatar,
    uploadingAvatar,
    metadata,
    footerSlot,
    onImageUpload,
    iframeAllowedUrls,
    onError,
  } = props;

  if (loading) {
    return (
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full min-w-0 flex-1 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-72 w-full lg:w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="w-full min-w-0 flex-1 space-y-6">
        <SettingsSection title={t('vc.profile.identity.title')} icon={<Bot className="size-4" />} iconColor="blue">
          <div className="space-y-6">
            <ProfileTextField
              label={t('vc.profile.identity.displayName.label')}
              hint={t('vc.profile.identity.displayName.hint')}
              value={values.displayName}
              error={values.displayName.trim() ? undefined : t('vc.profile.identity.displayName.required')}
              onChange={next => onChange({ displayName: next })}
            />
            <ProfileTextField
              label={t('vc.profile.identity.tagline.label')}
              hint={t('vc.profile.identity.tagline.hint')}
              value={values.tagline}
              onChange={next => onChange({ tagline: next })}
            />
            <ProfileFieldBlock
              label={t('vc.profile.identity.description.label')}
              hint={t('vc.profile.identity.description.hint')}
            >
              <MarkdownEditor
                value={values.description}
                onChange={next => onChange({ description: next })}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
            </ProfileFieldBlock>
            <ProfileFieldBlock label={t('vc.profile.keywords.label')} hint={t('vc.profile.keywords.hint')}>
              <TagsInput
                value={values.keywords.tags}
                onChange={next => onChange({ keywords: { ...values.keywords, tags: next } })}
                placeholder={t('vc.profile.keywords.placeholder')}
              />
            </ProfileFieldBlock>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('vc.profile.socialLinks.title')}
          icon={<Bookmark className="size-4" />}
          iconColor="rose"
          defaultOpen={false}
        >
          <ReferencesEditor
            rows={values.references.map(r => ({ id: r.id, name: r.name, uri: r.uri, description: r.description }))}
            onChange={onReferencesChange}
            onFileUpload={onReferenceFileUpload}
            uploadAccept={referenceUploadAccept}
          />
        </SettingsSection>

        {metadata && (metadata.host || metadata.bodyOfKnowledge) ? (
          <SettingsSection
            title={t('vc.profile.metadata.title')}
            icon={<Info className="size-4" />}
            iconColor="primary"
            defaultOpen={false}
          >
            <div className="space-y-3">
              {metadata.host ? <ReadOnlyMetadataRow row={metadata.host} /> : null}
              {metadata.bodyOfKnowledge ? <ReadOnlyMetadataRow row={metadata.bodyOfKnowledge} /> : null}
            </div>
          </SettingsSection>
        ) : null}

        {footerSlot}
      </div>

      <SettingsSection
        title={t('vc.profile.avatar.title')}
        icon={<ImageIcon className="size-4" />}
        iconColor="purple"
        collapsible={false}
        className="w-full shrink-0 lg:sticky lg:top-40 lg:w-64"
      >
        <ProfileImageCardBody
          imageUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName}
          uploading={uploadingAvatar}
          changeLabel={t('vc.profile.avatar.changeButton')}
          uploadingLabel={t('vc.profile.avatar.uploading')}
          helperText={t('vc.profile.avatar.helperText')}
          onFilePicked={onUploadAvatar}
        />
      </SettingsSection>
    </div>
  );
}

function ReadOnlyMetadataRow({ row }: { row: VcReadOnlyMetadataRow }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-caption text-muted-foreground">{row.label}</p>
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
