import { OrgProfileTabView } from '@/crd/components/organization/settings/OrgProfileTabView';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
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
 * Save mutations and the references batch live in `useOrgProfileTabData`;
 * the country list comes from the existing domain `COUNTRIES` constants.
 * CRD components never import that module directly per FR-006.
 */
const CrdOrgProfileTab = () => {
  const { organizationId } = useOrganizationContext();
  const data = useOrgProfileTabData(organizationId);

  return (
    <OrgProfileTabView
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

export default CrdOrgProfileTab;
