import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRolesOrganizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { isExclusivelyAuthorizationError } from '@/core/apollo/hooks/usePermissionDeniedNotifier';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { MembershipsSectionLabels } from '@/crd/components/contributor/settings/MembershipsSection.types';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { OrgMembershipTabView } from '@/crd/components/organization/settings/OrgMembershipTabView';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import useMembershipEnrichment from '../../../userPages/settings/membership/useMembershipEnrichment';
import { filterMemberships } from '../../../userPages/settings/membership/userMembershipMapper';
import { collectOrgMembershipSpaceIds, mapOrgMembershipRows } from './orgMembershipMapper';
import useOrgMembershipTabData from './useOrgMembershipTabData';

/**
 * Integration page for the organization Membership tab: the Spaces and
 * Subspaces the organization is a member of, each leavable by the
 * organization's admins. Wires `rolesOrganization` + per-space enrichment →
 * mapper → `OrgMembershipTabView`, resolves every label, and owns the Leave
 * `ConfirmationDialog` (CRD Golden Rule 9).
 */
const CrdOrgMembershipTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  // Until the organization is resolved, organizationId is '' and the roles
  // query is skipped (loading:false, no data). The context's loading flag can
  // read false during that beat (the URL resolver may hand back a stale settled
  // value while it fetches), so an unresolved organization counts as loading
  // too: the skeleton stays up instead of the "no memberships" caption.
  const { organizationId, loading: resolvingOrganization } = useOrganizationContext();

  const {
    data,
    loading: rolesLoading,
    refetch,
  } = useRolesOrganizationQuery({
    variables: { organizationId },
    skip: !organizationId,
  });

  usePageTitle(t('org.membership.pageTitle'));

  const enrichment = useMembershipEnrichment(collectOrgMembershipSpaceIds(data));
  const rows = mapOrgMembershipRows(data, enrichment);

  const state = useOrgMembershipTabData(organizationId, () => refetch());
  const visible = filterMemberships(rows, state.search, state.filter);

  const labels: MembershipsSectionLabels = {
    searchPlaceholder: t('org.membership.searchPlaceholder'),
    filterAll: t('org.membership.filter.all'),
    filterSpaces: t('org.membership.filter.spaces'),
    filterSubspaces: t('org.membership.filter.subspaces'),
    summary: (shown, total) => t('org.membership.summary', { shown, total }),
    filteredEmptyTitle: t('org.membership.filteredEmptyTitle'),
    filteredEmptyDescription: t('org.membership.filteredEmptyDescription'),
    clearFilters: t('org.membership.clearFilters'),
    emptyCaption: t('org.membership.empty'),
    typeSpace: t('org.membership.type.space'),
    typeSubspace: t('org.membership.type.subspace'),
    roleLabel: role => (role === 'Lead' ? t('org.membership.role.lead') : t('org.membership.role.member')),
    viewLabel: type => t('org.membership.menu.viewByType', { type }),
    leaveLabel: type => t('org.membership.leave.menuItemLabeled', { type }),
    menuTriggerAriaLabel: t('shared.account.kebabAriaLabel'),
    ledBy: t('org.membership.ledBy'),
    ledByAria: count => t('org.membership.ledByAria', { count }),
    leadsMore: count => t('org.membership.leadsMore', { count }),
  };

  const handleConfirmLeave = async (event: MouseEvent<HTMLButtonElement>) => {
    // Keep the dialog open, busy and non-interactive until the leave settles;
    // the hook clears the pending leave once it does.
    event.preventDefault();
    try {
      await state.onConfirmLeave();
      notify(t('org.membership.leave.success'), 'success');
    } catch (error) {
      // Only the organization's own admins and owners (or the Space's admins)
      // may remove it; retrying cannot fix a denial, so say so instead.
      notify(
        t(isExclusivelyAuthorizationError(error) ? 'org.membership.leave.forbidden' : 'org.membership.leave.error'),
        'error'
      );
    }
  };

  return (
    <>
      <OrgMembershipTabView
        loading={resolvingOrganization || rolesLoading || !organizationId}
        title={t('org.membership.title')}
        rows={visible}
        totalShown={visible.length}
        totalUnfiltered={rows.length}
        search={state.search}
        filter={state.filter}
        onSearchChange={state.onSearchChange}
        onFilterChange={state.onFilterChange}
        onClearFilters={state.onClearFilters}
        onLeave={row =>
          state.onRequestLeave({
            membershipId: row.id,
            spaceId: row.id,
            displayName: row.displayName,
          })
        }
        labels={labels}
      />
      <ConfirmationDialog
        open={Boolean(state.pendingLeave)}
        onOpenChange={open => {
          if (!open && !state.isLeaving) state.onCancelLeave();
        }}
        variant="destructive"
        title={t('org.membership.leave.dialogTitle')}
        description={t('org.membership.leave.dialogDescription', {
          spaceName: state.pendingLeave?.displayName ?? '',
        })}
        confirmLabel={t('org.membership.leave.dialogConfirm')}
        onConfirm={handleConfirmLeave}
        onCancel={state.onCancelLeave}
        loading={state.isLeaving}
      />
    </>
  );
};

export default CrdOrgMembershipTab;
