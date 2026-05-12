import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchUserOrganizationIdsQuery,
  useRemoveRoleFromUserMutation,
  useUserOrganizationIdsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { type OrgRowData, UserOrganizationsTabView } from '@/crd/components/user/settings/UserOrganizationsTabView';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useOrganizationEnrichment from './useOrganizationEnrichment';
import { filterOrganizations, mapUserOrganizations, type OrgRow } from './userOrganizationsMapper';

/**
 * Per research §3 (Decision #3) — heavy create flows navigate to existing
 * MUI admin routes. The org-creation route already exists in the codebase.
 */
const CREATE_ORGANIZATION_URL = '/admin/organizations/new';

type PendingDisassociate = { id: string; displayName: string; roleSetId: string };

/**
 * Integration page for the User Organizations tab. Wires:
 * - `useUserOrganizationIdsQuery` (org id list)
 * - `useOrganizationEnrichment` (per-row banner / verification / role / metrics
 *   via `useAssociatedOrganizationQuery`, mirroring MUI's `useAssociatedOrganization`)
 * - `useRemoveRoleFromUserMutation` (Disassociate, role=Associate)
 *
 * Owns the destructive `ConfirmationDialog` for Disassociate (Rule #9).
 */
const CrdUserOrganizationsTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();
  const { platformPrivilegeWrapper } = useCurrentUserContext();
  const showCreateButton =
    platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.CreateOrganization) ?? false;

  const { data, loading } = useUserOrganizationIdsQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
  });
  const organizationIds = data?.rolesUser.organizations.map(o => o.id) ?? [];
  const enrichment = useOrganizationEnrichment(organizationIds);

  const [search, setSearch] = useState('');
  const [pendingDisassociate, setPendingDisassociate] = useState<PendingDisassociate | null>(null);
  const [disassociate, { loading: isDisassociating }] = useRemoveRoleFromUserMutation();

  const allRows: OrgRow[] = mapUserOrganizations(organizationIds, enrichment);
  const visible = filterOrganizations(allRows, search);

  const onClearFilters = () => setSearch('');

  const onDisassociate = (row: OrgRowData) => {
    const enriched = allRows.find(r => r.id === row.id);
    if (!enriched || !enriched.roleSetId) return;
    setPendingDisassociate({
      id: row.id,
      displayName: row.displayName,
      roleSetId: enriched.roleSetId,
    });
  };

  const handleConfirmDisassociate = async () => {
    if (!pendingDisassociate || !userId) return;
    try {
      await disassociate({
        variables: {
          contributorId: userId,
          roleSetId: pendingDisassociate.roleSetId,
          role: RoleName.Associate,
        },
        refetchQueries: [refetchUserOrganizationIdsQuery({ userId })],
        awaitRefetchQueries: true,
      });
      notify(t('user.organizations.disassociate.success'), 'success');
    } catch {
      notify(t('user.organizations.disassociate.error'), 'error');
    } finally {
      setPendingDisassociate(null);
    }
  };

  return (
    <>
      <UserOrganizationsTabView
        loading={loading && organizationIds.length === 0}
        rows={visible}
        totalShown={visible.length}
        totalUnfiltered={allRows.length}
        search={search}
        onSearchChange={setSearch}
        onClearFilters={onClearFilters}
        showCreateButton={showCreateButton}
        onCreateOrganization={() => navigate(CREATE_ORGANIZATION_URL)}
        onDisassociate={onDisassociate}
      />
      <ConfirmationDialog
        open={Boolean(pendingDisassociate)}
        onOpenChange={open => {
          if (!open && !isDisassociating) setPendingDisassociate(null);
        }}
        variant="destructive"
        title={t('user.organizations.disassociate.dialogTitle')}
        description={t('user.organizations.disassociate.dialogDescription', {
          name: pendingDisassociate?.displayName ?? '',
        })}
        confirmLabel={t('user.organizations.disassociate.dialogConfirm')}
        onConfirm={handleConfirmDisassociate}
        onCancel={() => setPendingDisassociate(null)}
        loading={isDisassociating}
      />
    </>
  );
};

export default CrdUserOrganizationsTab;
