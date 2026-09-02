import { useTranslation } from 'react-i18next';
import { VCMembershipTabView } from '@/crd/components/virtualContributor/settings/VCMembershipTabView';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useVcMembershipTabData from './useVcMembershipTabData';

/**
 * Integration page for the VC Membership tab. Wires `useUrlResolver().vcId`
 * → `useVcMembershipTabData` (Leave + Accept/Decline state machine + per-row
 * enrichment) → `VCMembershipTabView` (presentational, including the two
 * `ConfirmationDialog` instances).
 */
const CrdVCMembershipTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const { vcId } = useUrlResolver();
  const data = useVcMembershipTabData(vcId);

  return (
    <VCMembershipTabView
      loading={data.loading}
      memberships={data.memberships}
      onRequestLeave={data.onRequestLeave}
      emptyMembershipsLabel={t('vc.membership.empty')}
      pendingInvitations={data.pendingInvitations}
      onRequestAccept={data.onRequestAccept}
      onRequestDecline={data.onRequestDecline}
      pendingInvitationsHeading={t('vc.membership.pendingInvitationsHeading')}
      leaveConfirm={data.leaveConfirm}
      acceptConfirm={data.acceptConfirm}
    />
  );
};

export default CrdVCMembershipTab;
