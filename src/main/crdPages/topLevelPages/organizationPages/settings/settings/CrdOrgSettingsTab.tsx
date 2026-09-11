import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationInfoDocument,
  refetchOrganizationSettingsQuery,
  useOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { UpdateOrganizationSettingsEntityInput } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { OrgSettingsTabView } from '@/crd/components/organization/settings/OrgSettingsTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { mapOrgSettings } from './orgSettingsMapper';

type SwitchKey = 'spaceInvitations' | 'domain' | 'applications' | 'privacy';

/**
 * Integration page for the Org Settings tab (US12). Four independent
 * switches — all wired through `updateOrganizationSettings` with the
 * optimistic-flip + hard-failure-revert + toast pattern (parity with
 * FR-133 and the User Settings communication switch).
 *
 * **No Design System toggle** here — that's User-only (FR-132).
 *
 * Every membership and privacy field is optional on the input and the server
 * writes only what is defined, so each toggle sends ONLY what it changes;
 * echoing a cached sibling value back would turn a partial merge into
 * last-write-wins (061).
 *
 * `allowUsersMatchingDomainToJoin` and `allowApplications` moved here from the
 * Associates tab (**R41**) — all three membership switches now sit together.
 * Both of them change what the organization's public profile hero offers a
 * viewer (Join / Apply / closed — FR-016), so they also refresh
 * `OrganizationInfo`, which carries that viewer-relative eligibility signal.
 */
const CrdOrgSettingsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const apolloClient = useApolloClient();
  const { organizationId, loading: loadingOrg } = useOrganizationContext();

  const { data, loading } = useOrganizationSettingsQuery({
    variables: { orgId: organizationId },
    skip: loadingOrg || !organizationId,
  });
  const mapped = mapOrgSettings(data);

  const [updateOrgSettings] = useUpdateOrganizationSettingsMutation();

  const [overrides, setOverrides] = useState<Partial<Record<SwitchKey, boolean>>>({});
  const [saving, setSaving] = useState<Partial<Record<SwitchKey, boolean>>>({});

  // Resolved values: the optimistic override wins until the mutation settles.
  const resolved = (key: SwitchKey, persisted: boolean) => overrides[key] ?? persisted;

  const commit = async (
    key: SwitchKey,
    next: boolean,
    settings: UpdateOrganizationSettingsEntityInput,
    { refreshProfileEligibility = false }: { refreshProfileEligibility?: boolean } = {}
  ) => {
    if (!organizationId) return;
    setOverrides(current => ({ ...current, [key]: next }));
    setSaving(current => ({ ...current, [key]: true }));
    try {
      await updateOrgSettings({
        variables: { settingsData: { organizationID: organizationId, settings } },
        refetchQueries: [refetchOrganizationSettingsQuery({ orgId: organizationId })],
        awaitRefetchQueries: true,
      });
      if (refreshProfileEligibility) {
        void apolloClient.refetchQueries({ include: [OrganizationInfoDocument] });
      }
    } catch {
      notify(t('org.settings.errorToast'), 'error');
    } finally {
      // Drop the override either way: on success the refetched value already
      // agrees with it, and on failure the persisted value is the truthful one.
      setOverrides(current => ({ ...current, [key]: undefined }));
      setSaving(current => ({ ...current, [key]: false }));
    }
  };

  return (
    <OrgSettingsTabView
      loading={loading && !data}
      allowSpaceInvitations={resolved('spaceInvitations', mapped.allowSpaceInvitations)}
      allowSpaceInvitationsSaving={Boolean(saving.spaceInvitations)}
      onToggleAllowSpaceInvitations={next =>
        void commit('spaceInvitations', next, { membership: { allowSpaceInvitations: next } })
      }
      allowUsersMatchingDomainToJoin={resolved('domain', mapped.allowUsersMatchingDomainToJoin)}
      allowUsersMatchingDomainToJoinSaving={Boolean(saving.domain)}
      onToggleAllowUsersMatchingDomainToJoin={next =>
        void commit(
          'domain',
          next,
          { membership: { allowUsersMatchingDomainToJoin: next } },
          { refreshProfileEligibility: true }
        )
      }
      allowApplications={resolved('applications', mapped.allowApplications)}
      allowApplicationsSaving={Boolean(saving.applications)}
      onToggleAllowApplications={next =>
        void commit(
          'applications',
          next,
          { membership: { allowApplications: next } },
          { refreshProfileEligibility: true }
        )
      }
      contributionRolesPubliclyVisible={resolved('privacy', mapped.contributionRolesPubliclyVisible)}
      privacySaving={Boolean(saving.privacy)}
      onToggleContributionRoles={next =>
        void commit('privacy', next, { privacy: { contributionRolesPubliclyVisible: next } })
      }
    />
  );
};

export default CrdOrgSettingsTab;
