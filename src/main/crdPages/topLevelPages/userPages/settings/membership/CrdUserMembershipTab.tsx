import { useTranslation } from 'react-i18next';
import {
  useUserContributionsQuery,
  useUserPendingMembershipsQuery,
  useUserSettingsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { UserMembershipTabView } from '@/crd/components/user/settings/UserMembershipTabView';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useMembershipEnrichment from './useMembershipEnrichment';
import { collectMembershipSpaceIds, filterMemberships, mapUserMembershipData } from './userMembershipMapper';
import useUserMembershipTabData from './useUserMembershipTabData';

/**
 * Integration page for the User Membership tab. Wires three Apollo queries
 * (contributions / settings / pending applications) → mapper → state hook
 * → presentational view. Owns the Leave `ConfirmationDialog` (Rule #9).
 */
const CrdUserMembershipTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();

  const {
    data: contributionsData,
    loading: contributionsLoading,
    refetch: refetchContributions,
  } = useUserContributionsQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
  });

  const { data: settingsData, loading: settingsLoading } = useUserSettingsQuery({
    variables: { userID: userId ?? '' },
    skip: !userId,
  });

  const { data: pendingData, loading: pendingLoading } = useUserPendingMembershipsQuery();

  // Enrich each row (banner / tagline / url / role-set) by fanning out
  // `useSpaceContributionDetailsQuery` per space id — same source the MUI
  // `ContributionCard` reads.
  const spaceIds = collectMembershipSpaceIds(contributionsData);
  const enrichment = useMembershipEnrichment(spaceIds);

  const state = useUserMembershipTabData(userId, async () => {
    await refetchContributions();
  });

  const mapped = mapUserMembershipData(contributionsData, settingsData, pendingData, enrichment, t);
  const visible = filterMemberships(mapped.rows, state.search, state.filter);

  const handleConfirmLeave = async () => {
    try {
      await state.onConfirmLeave();
      notify(t('user.membership.leave.success'), 'success');
    } catch {
      notify(t('user.membership.leave.error'), 'error');
    }
  };

  return (
    <>
      <UserMembershipTabView
        loading={contributionsLoading || settingsLoading || pendingLoading}
        homeSpaceOptions={mapped.homeSpace.options}
        selectedHomeSpaceId={mapped.homeSpace.selectedSpaceId}
        autoRedirect={mapped.homeSpace.autoRedirect}
        homeSpaceSaving={state.homeSpaceSaving}
        onSelectHomeSpace={spaceId => state.onSelectHomeSpace(spaceId, mapped.homeSpace.autoRedirect)}
        onToggleAutoRedirect={state.onToggleAutoRedirect}
        memberships={visible}
        totalMemberships={visible.length}
        totalUnfiltered={mapped.rows.length}
        search={state.search}
        filter={state.filter}
        onSearchChange={state.onSearchChange}
        onFilterChange={state.onFilterChange}
        onClearFilters={state.onClearFilters}
        onLeave={row => {
          // The view passes back the row it owns; recover the original
          // mapper row by id to get the correct `spaceId` (subspaces have
          // their own role-set scoped to the subspace itself, not the L0).
          const originalRow = mapped.rows.find(r => r.id === row.id);
          state.onRequestLeave({
            membershipId: row.id,
            spaceId: originalRow?.spaceId ?? row.id,
            displayName: row.displayName,
          });
        }}
        pendingApplications={mapped.pendingApplications}
      />
      <ConfirmationDialog
        open={Boolean(state.pendingLeave)}
        onOpenChange={open => {
          if (!open && !state.isLeaving) state.onCancelLeave();
        }}
        variant="destructive"
        title={t('user.membership.leave.dialogTitle')}
        description={t('user.membership.leave.dialogDescription', { spaceName: state.pendingLeave?.displayName ?? '' })}
        confirmLabel={t('user.membership.leave.dialogConfirm')}
        onConfirm={handleConfirmLeave}
        onCancel={state.onCancelLeave}
        loading={state.isLeaving}
      />
    </>
  );
};

export default CrdUserMembershipTab;
