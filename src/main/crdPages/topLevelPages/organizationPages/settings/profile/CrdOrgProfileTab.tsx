import { useTranslation } from 'react-i18next';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { OrgProfileTabView } from '@/crd/components/organization/settings/OrgProfileTabView';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import useStorageConfig from '@/domain/storage/StorageBucket/useStorageConfig';
import { MarkdownUploadScope } from '@/main/crdPages/markdown/MarkdownUploadScope';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import useOrgProfileTabData from './useOrgProfileTabData';

const EMPTY_VALUES = {
  profileId: '',
  organizationId: '',
  nameID: '',
  displayName: '',
  tagline: '',
  description: '',
  city: '',
  country: '',
  keywords: { id: undefined, tags: [] as string[] },
  capabilities: { id: undefined, tags: [] as string[] },
  contactEmail: '',
  domain: '',
  legalEntityName: '',
  website: '',
  avatar: { id: '', uri: null, altText: null },
  references: [] as never[],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
  verifiedStatus: 'notVerified' as const,
};

/**
 * Integration page for the Org Profile tab. Wires
 * `useOrganizationContext` (org id from the route) →
 * `useOrgProfileTabData` (per-section save hook, parallel to
 * `useUserProfileTabData`) → `OrgProfileTabView` (presentational).
 *
 * The settings shell mounts no ambient `StorageConfigContextProvider`, so
 * `MarkdownUploadScope` mounts an `organization`-scoped one (description
 * editing is always EDIT mode → `temporaryLocation: false`) and yields the
 * upload wiring; before the id resolves it yields `undefined`.
 *
 * Save mutations and the references batch live in `useOrgProfileTabData`;
 * the country list comes from the existing domain `COUNTRIES` constants.
 * CRD components never import that module directly per FR-006.
 */
const CrdOrgProfileTab = () => {
  const { organizationId } = useOrganizationContext();
  return (
    <MarkdownUploadScope storage={organizationId ? { locationType: 'organization', organizationId } : undefined}>
      {markdownUpload => <CrdOrgProfileTabBody markdownUpload={markdownUpload} />}
    </MarkdownUploadScope>
  );
};

const CrdOrgProfileTabBody = ({ markdownUpload }: { markdownUpload?: MarkdownUploadProps }) => {
  const { t } = useTranslation('crd-contributorSettings');
  const { organizationId } = useOrganizationContext();
  const data = useOrgProfileTabData(organizationId);

  // Reference file upload (paperclip) — uploads to the organization's storage bucket.
  const { storageConfig } = useStorageConfig({ locationType: 'organization', organizationId });
  const referenceUpload = useReferenceFileUpload(storageConfig);

  return (
    <>
      <OrgProfileTabView
        values={data.values ?? EMPTY_VALUES}
        countries={COUNTRIES}
        loading={data.loading}
        dirtyByField={data.dirtyByField}
        saveStatusByField={data.saveStatusByField}
        onChange={data.onChange}
        onReferencesChange={data.onReferencesChange}
        onReferenceFileUpload={referenceUpload.onFileUpload}
        referenceUploadAccept={referenceUpload.accept}
        onUpdateRecognizedReference={data.onUpdateRecognizedReference}
        onUploadAvatar={data.onUploadAvatar}
        uploadingAvatar={data.uploadingAvatar}
        onSaveSection={data.onSaveSection}
        {...markdownUpload}
      />
      <ImageCropDialog
        open={data.pendingAvatarCrop !== null}
        file={data.pendingAvatarCrop?.file}
        config={data.pendingAvatarCrop?.config ?? {}}
        onSave={({ file, altText }) => data.onAvatarCropComplete(file, altText)}
        onCancel={data.onAvatarCropCancel}
        title={t('shared.avatarCropDialog.title')}
        description={t('shared.avatarCropDialog.description')}
        altTextLabel={t('shared.avatarCropDialog.altTextLabel')}
        altTextPlaceholder={t('shared.avatarCropDialog.altTextPlaceholder')}
        saveLabel={t('shared.save')}
        savingLabel={t('shared.saving')}
        cancelLabel={t('shared.cancel')}
      />
    </>
  );
};

export default CrdOrgProfileTab;
