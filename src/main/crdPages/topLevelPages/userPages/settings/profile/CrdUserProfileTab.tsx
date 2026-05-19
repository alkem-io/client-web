import { useTranslation } from 'react-i18next';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { UserProfileTabView } from '@/crd/components/user/settings/UserProfileTabView';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { MarkdownUploadScope } from '@/main/crdPages/markdown/MarkdownUploadScope';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useUserProfileTabData from './useUserProfileTabData';

/**
 * Integration page for the User Profile tab. Wires
 * `useUserPageRouteContext` (096) → `useUserProfileTabData` (per-section
 * save hook) → `UserProfileTabView` (presentational).
 *
 * The settings shell mounts no ambient `StorageConfigContextProvider`, so
 * `MarkdownUploadScope` mounts a `user`-scoped one (the bio editor is always
 * EDIT mode → `temporaryLocation: false`) and yields the upload wiring; before
 * the id resolves it yields `undefined` and the editor hides the affordance.
 *
 * Save mutations and the references batch live in `useUserProfileTabData`;
 * the country list is supplied by the existing domain `COUNTRIES`
 * constants. CRD components never import that module directly per FR-006.
 */
const CrdUserProfileTab = () => {
  const { userId } = useUserPageRouteContext();
  return (
    <MarkdownUploadScope storage={userId ? { locationType: 'user', userId } : undefined}>
      {markdownUpload => <CrdUserProfileTabBody markdownUpload={markdownUpload} />}
    </MarkdownUploadScope>
  );
};

const CrdUserProfileTabBody = ({ markdownUpload }: { markdownUpload?: MarkdownUploadProps }) => {
  const { t } = useTranslation('crd-contributorSettings');
  const { userId } = useUserPageRouteContext();
  const data = useUserProfileTabData(userId);

  return (
    <>
      <UserProfileTabView
        values={data.values ?? EMPTY_VALUES}
        countries={COUNTRIES}
        loading={data.loading}
        dirtyByField={data.dirtyByField}
        saveStatusByField={data.saveStatusByField}
        onChange={data.onChange}
        onAddReference={data.onAddReference}
        onUpdateReference={data.onUpdateReference}
        onUpdateRecognizedReference={data.onUpdateRecognizedReference}
        onRequestRemoveReference={data.onRequestRemoveReference}
        onUploadAvatar={data.onUploadAvatar}
        uploadingAvatar={data.uploadingAvatar}
        onSaveSection={data.onSaveSection}
        pendingReferenceDelete={data.pendingReferenceDelete}
        onConfirmRemoveReference={data.onConfirmRemoveReference}
        onCancelRemoveReference={data.onCancelRemoveReference}
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

const EMPTY_VALUES = {
  profileId: '',
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tagline: '',
  city: '',
  country: '',
  bio: '',
  skills: { id: undefined, tags: [] as string[] },
  keywords: { id: undefined, tags: [] as string[] },
  avatar: { id: '', uri: null, altText: null },
  references: [] as never[],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
};

export default CrdUserProfileTab;
