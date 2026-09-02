import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { OrgCommunityTabView } from '@/crd/components/organization/settings/OrgCommunityTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { mapAvailableUserToPerson, mapCurrentMemberToPerson } from './orgCommunityMapper';
import useOrgAssociates from './useOrgAssociates';

/**
 * Integration page for the Org Community tab (US10 / Decision #5 / Q2 /
 * FR-112). Wires `useOrgAssociates` (which itself wraps
 * `useRoleSetManager` + `useRoleSetAvailableUsers`) → mapper →
 * `OrgCommunityTabView`. Owns the destructive `ConfirmationDialog` for
 * Remove (Rule #9) with role-aware confirm copy "Remove {{name}} as
 * Associate".
 */
const CrdOrgCommunityTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { roleSetId } = useOrganizationContext();

  const state = useOrgAssociates(roleSetId);

  const current = (state.current ?? []).map(mapCurrentMemberToPerson);
  const available = state.available.map(mapAvailableUserToPerson);

  const handleConfirmRemove = async () => {
    try {
      await state.onConfirmRemove();
      notify(t('org.community.removeSuccess'), 'success');
    } catch {
      notify(t('org.community.removeError'), 'error');
    }
  };

  return (
    <>
      <OrgCommunityTabView
        current={current}
        available={available}
        searchTerm={state.searchTerm}
        onSearchChange={state.onSearchChange}
        onAdd={state.onAdd}
        onRequestRemove={id => {
          const person = current.find(p => p.id === id);
          state.onRequestRemove(id, person?.displayName ?? '');
        }}
        onLoadMore={state.onLoadMore}
        hasMore={state.hasMore}
        loadingCurrent={state.loadingCurrent}
        loadingAvailable={state.loadingAvailable}
        updating={state.updating}
      />
      <ConfirmationDialog
        open={Boolean(state.pendingRemove)}
        onOpenChange={open => {
          if (!open && !state.updating) state.onCancelRemove();
        }}
        variant="destructive"
        title={t('org.community.removeDialogTitle')}
        description={t('org.community.removeDialogDescription', { name: state.pendingRemove?.displayName ?? '' })}
        confirmLabel={t('org.community.removeConfirmAssociate', { name: state.pendingRemove?.displayName ?? '' })}
        onConfirm={handleConfirmRemove}
        onCancel={state.onCancelRemove}
        loading={state.updating}
      />
    </>
  );
};

export default CrdOrgCommunityTab;
