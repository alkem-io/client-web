import { UserProfileTabView } from '@/crd/components/user/settings/UserProfileTabView';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useUserProfileTabData from './useUserProfileTabData';

/**
 * Integration page for the User Profile tab. Wires
 * `useUserPageRouteContext` (096) → `useUserProfileTabData` (per-section
 * save hook) → `UserProfileTabView` (presentational).
 *
 * Save mutations and the references batch live in `useUserProfileTabData`;
 * the country list is supplied by the existing domain `COUNTRIES`
 * constants. CRD components never import that module directly per FR-006.
 */
const CrdUserProfileTab = () => {
  const { userId } = useUserPageRouteContext();
  const data = useUserProfileTabData(userId);

  return (
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
    />
  );
};

const EMPTY_VALUES = {
  profileId: '',
  tagsetId: null,
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tagline: '',
  city: '',
  country: '',
  bio: '',
  tags: [] as string[],
  avatar: { id: '', uri: null, altText: null },
  references: [] as never[],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
};

export default CrdUserProfileTab;
