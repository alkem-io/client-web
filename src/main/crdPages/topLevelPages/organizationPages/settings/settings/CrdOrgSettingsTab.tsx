import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchOrganizationSettingsQuery,
  useOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { OrgSettingsTabView } from '@/crd/components/organization/settings/OrgSettingsTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { mapOrgSettings } from './orgSettingsMapper';

/**
 * Integration page for the Org Settings tab (US12). Two independent
 * switches — both wired through `updateOrganizationSettings` with the
 * optimistic-flip + hard-failure-revert + toast pattern (parity with
 * FR-133 and the User Settings communication switch).
 *
 * **No Design System toggle** here — that's User-only (FR-132).
 *
 * The mutation API expects BOTH membership and privacy fields per call;
 * the unchanged field is filled in from the most-recent resolved value.
 */
const CrdOrgSettingsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { organizationId, loading: loadingOrg } = useOrganizationContext();

  const { data, loading } = useOrganizationSettingsQuery({
    variables: { orgId: organizationId },
    skip: loadingOrg || !organizationId,
  });
  const mapped = mapOrgSettings(data);

  const [updateOrgSettings] = useUpdateOrganizationSettingsMutation();

  const [membershipOverride, setMembershipOverride] = useState<boolean | null>(null);
  const [membershipSaving, setMembershipSaving] = useState(false);

  const [privacyOverride, setPrivacyOverride] = useState<boolean | null>(null);
  const [privacySaving, setPrivacySaving] = useState(false);

  // Resolved values: optimistic override wins until the mutation settles.
  const allowDomain = membershipOverride ?? mapped.allowUsersMatchingDomainToJoin;
  const contributionRoles = privacyOverride ?? mapped.contributionRolesPubliclyVisible;

  const onToggleAllowDomain = async (next: boolean) => {
    if (!organizationId) return;
    setMembershipOverride(next);
    setMembershipSaving(true);
    try {
      await updateOrgSettings({
        variables: {
          settingsData: {
            organizationID: organizationId,
            settings: {
              membership: { allowUsersMatchingDomainToJoin: next },
              privacy: { contributionRolesPubliclyVisible: contributionRoles },
            },
          },
        },
        refetchQueries: [refetchOrganizationSettingsQuery({ orgId: organizationId })],
        awaitRefetchQueries: true,
      });
      setMembershipOverride(null);
    } catch {
      setMembershipOverride(null);
      notify(t('org.settings.errorToast'), 'error');
    } finally {
      setMembershipSaving(false);
    }
  };

  const onToggleContributionRoles = async (next: boolean) => {
    if (!organizationId) return;
    setPrivacyOverride(next);
    setPrivacySaving(true);
    try {
      await updateOrgSettings({
        variables: {
          settingsData: {
            organizationID: organizationId,
            settings: {
              membership: { allowUsersMatchingDomainToJoin: allowDomain },
              privacy: { contributionRolesPubliclyVisible: next },
            },
          },
        },
        refetchQueries: [refetchOrganizationSettingsQuery({ orgId: organizationId })],
        awaitRefetchQueries: true,
      });
      setPrivacyOverride(null);
    } catch {
      setPrivacyOverride(null);
      notify(t('org.settings.errorToast'), 'error');
    } finally {
      setPrivacySaving(false);
    }
  };

  return (
    <OrgSettingsTabView
      loading={loading && !data}
      allowUsersMatchingDomainToJoin={allowDomain}
      membershipSaving={membershipSaving}
      onToggleAllowDomain={onToggleAllowDomain}
      contributionRolesPubliclyVisible={contributionRoles}
      privacySaving={privacySaving}
      onToggleContributionRoles={onToggleContributionRoles}
    />
  );
};

export default CrdOrgSettingsTab;
