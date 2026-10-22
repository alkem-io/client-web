import { Bookmark, FileText, Link2, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryCombobox } from '@/crd/components/common/CountryCombobox';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import {
  ProfileFieldBlock as FieldBlock,
  ProfileImageCardBody,
  SocialLinksFields,
  ProfileTextField as TextField,
} from '@/crd/components/contributor/settings/ProfileFormFields';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { isValidPhoneOrEmpty } from '@/crd/lib/validators';
import { Input } from '@/crd/primitives/input';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { UserProfileViewProps } from './UserProfileTabView.types';

/**
 * User Settings → Profile tab. Collapsible sections (only Identity open by
 * default) with boxed inputs, plus the profile-picture card on the right. Every
 * edit goes to the consumer's buffer and is saved through the settings page's
 * unsaved-changes bar (spec 097 Session 2026-10-22); only the avatar upload
 * commits immediately.
 */
export function UserProfileTabView(props: UserProfileViewProps) {
  const { t } = useTranslation('crd-contributorSettings');
  const {
    values,
    countries,
    loading,
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
        <Skeleton className="h-72 w-full lg:w-64" />
      </div>
    );
  }

  const requiredError = (value: string, message: string) => (value.trim() ? undefined : message);

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="w-full min-w-0 flex-1 space-y-6">
        <SettingsSection
          title={t('user.profile.identity.title')}
          icon={<UserIcon className="size-4" />}
          iconColor="blue"
        >
          <div className="space-y-4">
            <TextField
              label={t('user.profile.identity.displayName.label')}
              hint={t('user.profile.identity.displayName.hint')}
              value={values.displayName}
              error={requiredError(values.displayName, t('user.profile.identity.displayName.required'))}
              onChange={next => onChange({ displayName: next })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label={t('user.profile.identity.firstName.label')}
                hint={t('user.profile.identity.firstName.hint')}
                value={values.firstName}
                error={requiredError(values.firstName, t('user.profile.identity.firstName.required'))}
                onChange={next => onChange({ firstName: next })}
              />
              <TextField
                label={t('user.profile.identity.lastName.label')}
                hint={t('user.profile.identity.lastName.hint')}
                value={values.lastName}
                error={requiredError(values.lastName, t('user.profile.identity.lastName.required'))}
                onChange={next => onChange({ lastName: next })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label={t('user.profile.identity.email.label')}
                hint={t('user.profile.identity.email.readOnlyCaption')}
                value={values.email}
                icon={Mail}
                readOnly={true}
              />
              <TextField
                label={t('user.profile.identity.phone.label')}
                hint={t('user.profile.identity.phone.hint')}
                value={values.phone}
                icon={Phone}
                error={isValidPhoneOrEmpty(values.phone) ? undefined : t('user.profile.identity.phone.invalidFormat')}
                onChange={next => onChange({ phone: next })}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('user.profile.aboutYou.title')}
          icon={<FileText className="size-4" />}
          iconColor="green"
          defaultOpen={false}
        >
          <div className="space-y-6">
            <TextField
              label={t('user.profile.aboutYou.tagline.label')}
              hint={t('user.profile.aboutYou.tagline.hint')}
              value={values.tagline}
              onChange={next => onChange({ tagline: next })}
            />
            <fieldset>
              <legend className="mb-1.5 text-body-emphasis">{t('user.profile.aboutYou.location.title')}</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  value={values.city}
                  onChange={e => onChange({ city: e.target.value })}
                  placeholder={t('user.profile.aboutYou.location.city')}
                  aria-label={t('user.profile.aboutYou.location.city')}
                />
                <CountryCombobox
                  className="w-full"
                  value={values.country}
                  onChange={code => onChange({ country: code })}
                  countries={countries}
                  placeholder={t('user.profile.aboutYou.location.countryPlaceholder')}
                />
              </div>
            </fieldset>
            <FieldBlock label={t('user.profile.aboutYou.bio.label')} hint={t('user.profile.aboutYou.bio.hint')}>
              <MarkdownEditor
                value={values.bio}
                onChange={next => onChange({ bio: next })}
                onImageUpload={onImageUpload}
                iframeAllowedUrls={iframeAllowedUrls}
                onError={onError}
              />
            </FieldBlock>
            <FieldBlock label={t('user.profile.aboutYou.skills.label')} hint={t('user.profile.aboutYou.skills.hint')}>
              <TagsInput
                value={values.skills.tags}
                onChange={next => onChange({ skills: { ...values.skills, tags: next } })}
                placeholder={t('user.profile.aboutYou.skills.placeholder')}
              />
            </FieldBlock>
            <FieldBlock
              label={t('user.profile.aboutYou.keywords.label')}
              hint={t('user.profile.aboutYou.keywords.hint')}
            >
              <TagsInput
                value={values.keywords.tags}
                onChange={next => onChange({ keywords: { ...values.keywords, tags: next } })}
                placeholder={t('user.profile.aboutYou.keywords.placeholder')}
              />
            </FieldBlock>
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('user.profile.socialLinks.title')}
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
              linkedin: t('user.profile.socialLinks.linkedinPlaceholder'),
              bsky: t('user.profile.socialLinks.bskyPlaceholder'),
              github: t('user.profile.socialLinks.githubPlaceholder'),
            }}
            onChange={onUpdateRecognizedReference}
          />
        </SettingsSection>

        <SettingsSection
          title={t('user.profile.references.title')}
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
        title={t('user.profile.avatar.title')}
        icon={<UserIcon className="size-4" />}
        iconColor="purple"
        collapsible={false}
        className="w-full shrink-0 lg:sticky lg:top-40 lg:w-64"
      >
        <ProfileImageCardBody
          imageUrl={values.avatar.uri ?? undefined}
          displayName={values.displayName || values.firstName || values.email}
          uploading={uploadingAvatar}
          changeLabel={t('user.profile.avatar.changeButton')}
          uploadingLabel={t('user.profile.avatar.uploading')}
          helperText={t('user.profile.avatar.helperText')}
          onFilePicked={onUploadAvatar}
        />
      </SettingsSection>
    </div>
  );
}
