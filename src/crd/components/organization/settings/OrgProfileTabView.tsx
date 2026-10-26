import { Bookmark, Building2, FileText, Globe, Image as ImageIcon, Link2, Mail } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { type OrgVerificationStatus, OrgVerifiedBadge } from '@/crd/components/contributor/settings/OrgVerifiedBadge';
import {
  ProfileFieldBlock,
  ProfileImageCardBody,
  ProfileTextField,
  SocialLinksFields,
} from '@/crd/components/contributor/settings/ProfileFormFields';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { isValidEmailOrEmpty, isValidUrlOrEmpty } from '@/crd/lib/validators';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

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
  /** True while a Save runs: the form is frozen, so nothing typed is lost to the post-save rebase. */
  disabled?: boolean;
  onChange: (patch: Partial<OrgProfileFormValuesData>) => void;
  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — passed through to the shared editor. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;
} & MarkdownUploadProps;

/**
 * Org Settings → Profile tab. Collapsible sections (only Identity open by
 * default) with boxed inputs — Identity, About, Contact & Legal, Social Links,
 * References — and the logo card with the read-only verification badge on the
 * right (FR-094). Every edit goes to the consumer's buffer and is saved through
 * the settings page's unsaved-changes bar (spec 097 Session 2026-10-22); only
 * the logo upload commits immediately.
 */
export function OrgProfileTabView(props: OrgProfileViewProps) {
  const { t } = useTranslation(NS);
  const cityId = useId();
  const {
    values,
    countries,
    loading,
    disabled = false,
    onChange,
    onReferencesChange,
    onReferenceFileUpload,
    referenceUploadAccept,
    onUpdateRecognizedReference,
    onUploadAvatar,
    uploadingAvatar,
    onImageUpload,
    iframeAllowedUrls,
    onError,
  } = props;

  if (loading || !values) {
    return (
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full min-w-0 flex-1 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-72 w-full lg:w-72" />
      </div>
    );
  }

  return (
    <div inert={disabled} aria-busy={disabled} className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="w-full min-w-0 flex-1 space-y-6">
        <SettingsSection
          title={t('org.profile.identity.title')}
          icon={<Building2 className="size-4" />}
          iconColor="blue"
        >
          <div className="space-y-4">
            <ProfileTextField
              label={t('org.profile.identity.displayName.label')}
              hint={t('org.profile.identity.displayName.hint')}
              value={values.displayName}
              error={values.displayName.trim() ? undefined : t('org.profile.identity.displayName.required')}
              onChange={next => onChange({ displayName: next })}
            />
            <ProfileTextField
              label={t('org.profile.identity.nameID.label')}
              hint={t('org.profile.identity.nameID.caption')}
              value={values.nameID}
              readOnly={true}
              className="font-mono"
            />
            <ProfileTextField
              label={t('org.profile.identity.tagline.label')}
              hint={t('org.profile.identity.tagline.hint')}
              value={values.tagline}
              onChange={next => onChange({ tagline: next })}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('org.profile.about.title')}
          icon={<FileText className="size-4" />}
          iconColor="green"
          defaultOpen={false}
        >
          <div className="space-y-6">
            <ProfileFieldBlock
              label={t('org.profile.about.description.label')}
              hint={t('org.profile.about.description.hint')}
            >
              <MarkdownEditor
                value={values.description}
                onChange={next => onChange({ description: next })}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
            </ProfileFieldBlock>
            <fieldset>
              <legend className="mb-1.5 text-body-emphasis">{t('org.profile.about.location.title')}</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={cityId} className="mb-1 text-caption text-muted-foreground">
                    {t('org.profile.about.location.city')}
                  </Label>
                  <Input
                    id={cityId}
                    value={values.city}
                    onChange={e => onChange({ city: e.target.value })}
                    placeholder={t('org.profile.about.location.city')}
                  />
                </div>
                <div>
                  <p className="mb-1 text-caption text-muted-foreground">{t('org.profile.about.location.country')}</p>
                  <CountryCombobox
                    className="w-full"
                    value={values.country}
                    onChange={code => onChange({ country: code })}
                    countries={countries}
                    placeholder={t('org.profile.about.location.countryPlaceholder')}
                  />
                </div>
              </div>
            </fieldset>
            <ProfileFieldBlock
              label={t('org.profile.about.keywords.label')}
              hint={t('org.profile.about.keywords.hint')}
            >
              <TagsInput
                value={values.keywords.tags}
                onChange={next => onChange({ keywords: { ...values.keywords, tags: next } })}
                placeholder={t('org.profile.about.keywords.placeholder')}
              />
            </ProfileFieldBlock>
            <ProfileFieldBlock
              label={t('org.profile.about.capabilities.label')}
              hint={t('org.profile.about.capabilities.hint')}
            >
              <TagsInput
                value={values.capabilities.tags}
                onChange={next => onChange({ capabilities: { ...values.capabilities, tags: next } })}
                placeholder={t('org.profile.about.capabilities.placeholder')}
              />
            </ProfileFieldBlock>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('org.profile.contactLegal.title')}
          icon={<Mail className="size-4" />}
          iconColor="amber"
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileTextField
              label={t('org.profile.contactLegal.contactEmail.label')}
              hint={t('org.profile.contactLegal.contactEmail.hint')}
              value={values.contactEmail}
              icon={Mail}
              placeholder="contact@example.org"
              error={
                isValidEmailOrEmpty(values.contactEmail)
                  ? undefined
                  : t('org.profile.contactLegal.contactEmail.invalidFormat')
              }
              onChange={next => onChange({ contactEmail: next })}
            />
            <ProfileTextField
              label={t('org.profile.contactLegal.domain.label')}
              hint={t('org.profile.contactLegal.domain.hint')}
              value={values.domain}
              placeholder="example.org"
              onChange={next => onChange({ domain: next })}
            />
            <ProfileTextField
              label={t('org.profile.contactLegal.legalEntityName.label')}
              hint={t('org.profile.contactLegal.legalEntityName.hint')}
              value={values.legalEntityName}
              onChange={next => onChange({ legalEntityName: next })}
            />
            <ProfileTextField
              label={t('org.profile.contactLegal.website.label')}
              hint={t('org.profile.contactLegal.website.hint')}
              value={values.website}
              icon={Globe}
              placeholder="https://example.org"
              error={
                isValidUrlOrEmpty(values.website) ? undefined : t('org.profile.contactLegal.website.invalidFormat')
              }
              onChange={next => onChange({ website: next })}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('org.profile.socialLinks.title')}
          icon={<Link2 className="size-4" />}
          iconColor="blue"
          defaultOpen={false}
        >
          <SocialLinksFields
            values={{
              linkedin: values.recognizedReferences.linkedin?.uri ?? '',
              bsky: values.recognizedReferences.bsky?.uri ?? '',
              github: values.recognizedReferences.github?.uri ?? '',
            }}
            placeholders={{
              linkedin: t('org.profile.socialLinks.linkedinPlaceholder'),
              bsky: t('org.profile.socialLinks.bskyPlaceholder'),
              github: t('org.profile.socialLinks.githubPlaceholder'),
            }}
            onChange={onUpdateRecognizedReference}
          />
        </SettingsSection>

        <SettingsSection
          title={t('org.profile.references.title')}
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
      </div>

      <SettingsSection
        title={t('org.profile.logo.title')}
        icon={<ImageIcon className="size-4" />}
        iconColor="purple"
        collapsible={false}
        className="w-full shrink-0 lg:sticky lg:top-40 lg:w-72"
      >
        <ProfileImageCardBody
          imageUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName}
          shape="square"
          extra={<OrgVerifiedBadge status={values.verifiedStatus} />}
          uploading={uploadingAvatar}
          changeLabel={t('org.profile.logo.changeButton')}
          uploadingLabel={t('org.profile.logo.uploading')}
          helperText={t('org.profile.logo.helperText')}
          onFilePicked={onUploadAvatar}
        />
      </SettingsSection>
    </div>
  );
}
