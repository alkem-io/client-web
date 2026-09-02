import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  type AuthorizationSubTab,
  OrgAuthorizationTabView,
} from '@/crd/components/organization/settings/OrgAuthorizationTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { mapAvailableUserToPerson, mapCurrentMemberToPerson } from './orgAuthorizationMapper';
import useOrgRoleAssignment from './useOrgRoleAssignment';

/**
 * Integration page for the Org Authorization tab (US11).
 *
 * Holds the active sub-tab in local React state (no URL sync per FR-120).
 * Mounts two `useOrgRoleAssignment` instances — one per role — so both
 * caches stay warm and switching sub-tabs is instant. The destructive
 * `ConfirmationDialog`s render at the page level (Rule #9 / FR-121) with
 * role-aware confirm copy ("Remove {{name}} as Admin" / "as Owner").
 */
const CrdOrgAuthorizationTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { roleSetId } = useOrganizationContext();
  const [activeSubTab, setActiveSubTab] = useState<AuthorizationSubTab>('admin');

  const adminState = useOrgRoleAssignment(roleSetId, RoleName.Admin);
  const ownerState = useOrgRoleAssignment(roleSetId, RoleName.Owner);

  const adminCurrent = (adminState.current ?? []).map(mapCurrentMemberToPerson);
  const adminAvailable = adminState.available.map(mapAvailableUserToPerson);

  const ownerCurrent = (ownerState.current ?? []).map(mapCurrentMemberToPerson);
  const ownerAvailable = ownerState.available.map(mapAvailableUserToPerson);

  const handleAdminConfirm = async () => {
    try {
      await adminState.onConfirmRemove();
      notify(t('org.authorization.removeSuccessAdmin'), 'success');
    } catch {
      notify(t('org.authorization.removeError'), 'error');
    }
  };

  const handleOwnerConfirm = async () => {
    try {
      await ownerState.onConfirmRemove();
      notify(t('org.authorization.removeSuccessOwner'), 'success');
    } catch {
      notify(t('org.authorization.removeError'), 'error');
    }
  };

  return (
    <>
      <OrgAuthorizationTabView
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        admin={{
          current: adminCurrent,
          available: adminAvailable,
          searchTerm: adminState.searchTerm,
          onSearchChange: adminState.onSearchChange,
          onAdd: adminState.onAdd,
          onRequestRemove: id => {
            const person = adminCurrent.find(p => p.id === id);
            adminState.onRequestRemove(id, person?.displayName ?? '');
          },
          onLoadMore: adminState.onLoadMore,
          hasMore: adminState.hasMore,
          loadingCurrent: adminState.loadingCurrent,
          loadingAvailable: adminState.loadingAvailable,
          updating: adminState.updating,
        }}
        owner={{
          current: ownerCurrent,
          available: ownerAvailable,
          searchTerm: ownerState.searchTerm,
          onSearchChange: ownerState.onSearchChange,
          onAdd: ownerState.onAdd,
          onRequestRemove: id => {
            const person = ownerCurrent.find(p => p.id === id);
            ownerState.onRequestRemove(id, person?.displayName ?? '');
          },
          onLoadMore: ownerState.onLoadMore,
          hasMore: ownerState.hasMore,
          loadingCurrent: ownerState.loadingCurrent,
          loadingAvailable: ownerState.loadingAvailable,
          updating: ownerState.updating,
        }}
      />
      <ConfirmationDialog
        open={Boolean(adminState.pendingRemove)}
        onOpenChange={open => {
          if (!open && !adminState.updating) adminState.onCancelRemove();
        }}
        variant="destructive"
        title={t('org.authorization.removeDialogTitle')}
        description={t('org.authorization.removeDialogDescription', {
          name: adminState.pendingRemove?.displayName ?? '',
        })}
        confirmLabel={t('org.authorization.removeConfirmAdmin', {
          name: adminState.pendingRemove?.displayName ?? '',
        })}
        onConfirm={handleAdminConfirm}
        onCancel={adminState.onCancelRemove}
        loading={adminState.updating}
      />
      <ConfirmationDialog
        open={Boolean(ownerState.pendingRemove)}
        onOpenChange={open => {
          if (!open && !ownerState.updating) ownerState.onCancelRemove();
        }}
        variant="destructive"
        title={t('org.authorization.removeDialogTitle')}
        description={t('org.authorization.removeDialogDescription', {
          name: ownerState.pendingRemove?.displayName ?? '',
        })}
        confirmLabel={t('org.authorization.removeConfirmOwner', {
          name: ownerState.pendingRemove?.displayName ?? '',
        })}
        onConfirm={handleOwnerConfirm}
        onCancel={ownerState.onCancelRemove}
        loading={ownerState.updating}
      />
    </>
  );
};

export default CrdOrgAuthorizationTab;
