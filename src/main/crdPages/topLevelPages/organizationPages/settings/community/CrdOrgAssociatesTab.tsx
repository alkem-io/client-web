import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  OrgAssociateSettingsDialog,
  type OrgAssociateSettingsSubject,
} from '@/crd/components/organization/settings/OrgAssociateSettingsDialog';
import { OrgAssociatesTabView } from '@/crd/components/organization/settings/OrgAssociatesTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import {
  MembershipDetailDialogConnector,
  type ViewingMembership,
} from '@/main/crdPages/topLevelPages/spaceSettings/community/MembershipDetailDialogConnector';
import { OrgInviteAssociatesDialogConnector } from './OrgInviteAssociatesDialogConnector';
import { useOrgAssociatesTabData } from './useOrgAssociatesTabData';

const ROLE_LIMIT_KEY_BY_ERROR = {
  limitAdmin: 'org.associates.errors.limitAdmin',
  limitOwner: 'org.associates.errors.limitOwner',
  minOwner: 'org.associates.errors.minOwner',
} as const;

/**
 * Integration page for the Associates tab (replaces the old Community tab, D14).
 * Wires `useOrgAssociatesTabData` (union list + role editor + pending applications &
 * invitations + the two membership switches + invite) to `OrgAssociatesTabView`.
 */
const CrdOrgAssociatesTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { roleSetId, displayName } = useOrganizationContext();

  usePageTitle(t('org.community.pageTitle'));

  const state = useOrgAssociatesTabData(roleSetId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingMembership, setViewingMembership] = useState<ViewingMembership | null>(null);

  const editingRow = state.associates.find(a => a.id === editingId) ?? null;
  const editingSubject: OrgAssociateSettingsSubject | null = editingRow
    ? {
        id: editingRow.id,
        displayName: editingRow.displayName,
        avatarUrl: editingRow.avatarUrl,
        color: editingRow.color,
        isAssociate: editingRow.isAssociate,
        isAdmin: editingRow.isAdmin,
        isOwner: editingRow.isOwner,
      }
    : null;

  const roleLimitErrorMessage = state.roleLimitError ? t(ROLE_LIMIT_KEY_BY_ERROR[state.roleLimitError]) : undefined;

  const handleSave = async (next: { isAssociate: boolean; isAdmin: boolean; isOwner: boolean }) => {
    if (!editingRow) return;
    state.clearRoleLimitError();
    const diffs: Array<['Associate' | 'Admin' | 'Owner', boolean]> = [
      // Owner/Admin first: turning an elevated role OFF while Associate is still
      // being turned off in the same save would otherwise transiently violate
      // requiresEntryRole on a role that is being removed anyway.
      ['Owner', next.isOwner],
      ['Admin', next.isAdmin],
      ['Associate', next.isAssociate],
    ];
    try {
      for (const [role, on] of diffs) {
        const current =
          role === 'Owner' ? editingRow.isOwner : role === 'Admin' ? editingRow.isAdmin : editingRow.isAssociate;
        if (current !== on) {
          await state.onToggleRole(editingRow.id, role, on);
        }
      }
      setEditingId(null);
    } catch {
      // roleLimitError (if any) is already set by onToggleRole; the dialog stays open to show it.
    }
  };

  return (
    <>
      <OrgAssociatesTabView
        associates={state.associates}
        loading={state.loading}
        canManage={state.canManage}
        manageDisabledReason={state.manageDisabledReason}
        onEdit={setEditingId}
        onInvite={state.openInvite}
        pending={state.pendingMemberships}
        onPendingApprove={state.onPendingApprove}
        onPendingReject={state.onPendingReject}
        onPendingRevoke={state.onPendingRevoke}
        onPendingView={id => {
          const item = state.pendingMemberships.find(m => m.id === id);
          if (item) setViewingMembership({ id: item.id, type: item.type });
        }}
        allowUsersMatchingDomainToJoin={state.switches.allowUsersMatchingDomainToJoin}
        allowApplications={state.switches.allowApplications}
        switchesSaving={state.switches.saving}
        onToggleAllowDomain={next => void state.switches.onToggleAllowDomain(next)}
        onToggleAllowApplications={next => void state.switches.onToggleAllowApplications(next)}
      />

      <OrgAssociateSettingsDialog
        open={editingId !== null}
        onOpenChange={open => {
          if (!open) {
            setEditingId(null);
            state.clearRoleLimitError();
          }
        }}
        subject={editingSubject}
        saving={state.updating}
        errorMessage={roleLimitErrorMessage}
        onSave={handleSave}
        onRemove={() => {
          if (!editingRow) return;
          setEditingId(null);
          state.onRequestRemoveAll(editingRow.id, editingRow.displayName);
        }}
      />

      <ConfirmationDialog
        open={Boolean(state.pendingRemove)}
        onOpenChange={open => {
          if (!open) state.onCancelRemoveAll();
        }}
        variant="destructive"
        title={t('org.associates.editor.removeConfirmTitle', { name: state.pendingRemove?.displayName ?? '' })}
        description={t('org.associates.editor.removeConfirmBody', { name: state.pendingRemove?.displayName ?? '' })}
        confirmLabel={t('org.associates.editor.remove')}
        onConfirm={state.onConfirmRemoveAll}
        onCancel={state.onCancelRemoveAll}
        loading={state.updating}
      />

      <MembershipDetailDialogConnector
        membership={viewingMembership}
        onOpenChange={open => {
          if (!open) setViewingMembership(null);
        }}
      />

      <OrgInviteAssociatesDialogConnector
        open={state.inviteOpen}
        onClose={state.closeInvite}
        roleSetId={roleSetId}
        organizationName={displayName}
        existingAssociateIds={state.associates.filter(a => a.isAssociate).map(a => a.id)}
        onSent={state.refetchPending}
      />
    </>
  );
};

export default CrdOrgAssociatesTab;
