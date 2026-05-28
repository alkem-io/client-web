import { useTranslation } from 'react-i18next';
import { useVirtualContributorProviderQuery, useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { VCProfileTabView } from '@/crd/components/virtualContributor/settings/VCProfileTabView';
import type {
  VcProfileFormValues,
  VcReadOnlyMetadataRow,
} from '@/crd/components/virtualContributor/settings/VCProfileTabView.types';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import useStorageConfig from '@/domain/storage/StorageBucket/useStorageConfig';
import { MarkdownUploadScope } from '@/main/crdPages/markdown/MarkdownUploadScope';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useVcProfileTabData from './useVcProfileTabData';

/**
 * Integration page for the VC Profile tab. Wires `useUrlResolver().vcId` →
 * `useVcProfileTabData` (per-section save hook) → `VCProfileTabView`
 * (presentational).
 *
 * The settings shell mounts no ambient `StorageConfigContextProvider`, so
 * `MarkdownUploadScope` mounts a `virtualContributor`-scoped one (description
 * editing is always EDIT mode → `temporaryLocation: false`) and yields the
 * upload wiring; before the id resolves it yields `undefined`.
 *
 * Mounts `ImageCropDialog` driven by `pendingAvatarCrop` (Decision #10 /
 * FR-163) and `ConfirmationDialog` driven by `pendingReferenceDelete`
 * (Rule #9 / FR-025 — handled inside the view component).
 */
const CrdVCProfileTab = () => {
  const { vcId } = useUrlResolver();
  return (
    <MarkdownUploadScope
      storage={vcId ? { locationType: 'virtualContributor', virtualContributorId: vcId } : undefined}
    >
      {markdownUpload => <CrdVCProfileTabBody markdownUpload={markdownUpload} />}
    </MarkdownUploadScope>
  );
};

const CrdVCProfileTabBody = ({ markdownUpload }: { markdownUpload?: MarkdownUploadProps }) => {
  const { t } = useTranslation('crd-contributorSettings');
  const { vcId } = useUrlResolver();
  const data = useVcProfileTabData(vcId);

  // Reference file upload (paperclip) — uploads to the VC's storage bucket.
  const { storageConfig } = useStorageConfig({
    locationType: 'virtualContributor',
    virtualContributorId: vcId ?? '',
    skip: !vcId,
  });
  const referenceUpload = useReferenceFileUpload(storageConfig);

  // Read-only metadata rows: host + body-of-knowledge description. The host
  // comes from the separate `useVirtualContributorProviderQuery`; the BoK
  // description is already on the main VirtualContributor query.
  const { data: providerData } = useVirtualContributorProviderQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });
  const { data: vcData } = useVirtualContributorQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const providerProfile = providerData?.lookup.virtualContributor?.provider?.profile;
  const host: VcReadOnlyMetadataRow | undefined = providerProfile
    ? {
        label: t('vc.profile.metadata.hostLabel'),
        value: providerProfile.displayName,
        href: providerProfile.url,
      }
    : undefined;

  const bokDescription = vcData?.lookup.virtualContributor?.bodyOfKnowledgeDescription;
  const bodyOfKnowledge: VcReadOnlyMetadataRow | undefined = bokDescription
    ? {
        label: t('vc.profile.metadata.bodyOfKnowledgeLabel'),
        value: bokDescription,
      }
    : undefined;

  return (
    <>
      <VCProfileTabView
        values={data.values ?? EMPTY_VALUES}
        loading={data.loading}
        dirtyByField={data.dirtyByField}
        saveStatusByField={data.saveStatusByField}
        onChange={data.onChange}
        onReferencesChange={data.onReferencesChange}
        onReferenceFileUpload={referenceUpload.onFileUpload}
        referenceUploadAccept={referenceUpload.accept}
        onUploadAvatar={data.onUploadAvatar}
        uploadingAvatar={data.uploadingAvatar}
        onSaveSection={data.onSaveSection}
        metadata={{ host, bodyOfKnowledge }}
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

const EMPTY_VALUES: VcProfileFormValues = {
  profileId: '',
  displayName: '',
  tagline: '',
  description: '',
  keywords: { id: undefined, tags: [] },
  avatar: { id: '', uri: null, altText: null },
  references: [],
};

export default CrdVCProfileTab;
