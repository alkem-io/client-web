import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { OrgInvitationsTabView } from '@/crd/components/organization/settings/OrgInvitationsTabView';
import type { OrgInvitationRow } from '@/crd/components/organization/settings/OrgInvitationsTabView.types';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatShortDate } from '@/crd/lib/dateTimeFormat';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { useOrgInvitationsTabData } from './useOrgInvitationsTabData';

/**
 * Integration page for the organization Invitations tab. Wires
 * `useOrganizationContext().organizationId` → `useOrgInvitationsTabData`
 * (query, accept-confirm state machine, decline) → `OrgInvitationsTabView`
 * (presentational). Owns every `t()` resolution — the view stays label-free.
 */
const CrdOrgInvitationsTab = () => {
  const { t, i18n } = useTranslation('crd-contributorSettings');
  const locale = resolveDateFnsLocale(i18n.language);
  const { organizationId } = useOrganizationContext();
  const data = useOrgInvitationsTabData(organizationId);

  usePageTitle(t('org.invitations.pageTitle'));

  const roleLabel = (role: 'member' | 'memberLead') =>
    role === 'memberLead' ? t('org.invitations.roleMemberLead') : t('org.invitations.roleMember');

  const rows: OrgInvitationRow[] = data.rows.map(row => ({
    id: row.id,
    spaceDisplayName: row.spaceDisplayName,
    spaceUrl: row.spaceUrl,
    invitedByText: row.invitedBy
      ? t('org.invitations.invitedBy', { name: row.invitedBy })
      : t('org.invitations.invitedByUnknown'),
    dateText: formatShortDate(row.createdDate, locale) ?? '',
    roleLabel: roleLabel(row.role),
    welcomeMessage: row.welcomeMessage,
    spacesToJoinText:
      row.spacesToJoin.length > 1
        ? t('org.invitations.spacesToJoin', { spaces: row.spacesToJoin.map(space => space.displayName).join(', ') })
        : undefined,
    canAct: row.canAct,
  }));

  const pendingRow = data.rows.find(row => row.id === data.acceptConfirm.pendingId);

  return (
    <OrgInvitationsTabView
      loading={data.loading}
      title={t('org.invitations.title')}
      rows={rows}
      emptyLabel={t('org.invitations.empty')}
      acceptLabel={t('org.invitations.accept')}
      declineLabel={t('org.invitations.decline')}
      onAccept={data.onRequestAccept}
      onDecline={data.onDecline}
      acceptConfirm={{
        open: Boolean(data.acceptConfirm.pendingId),
        title: t('org.invitations.acceptConfirmTitle'),
        body: t('org.invitations.acceptConfirmBody', {
          spaceName: data.acceptConfirm.pendingSpaceName ?? '',
          role: pendingRow ? roleLabel(pendingRow.role) : '',
        }),
        confirmLabel: t('org.invitations.acceptConfirmAction'),
        onConfirm: data.acceptConfirm.onConfirm,
        onCancel: data.acceptConfirm.onCancel,
      }}
    />
  );
};

export default CrdOrgInvitationsTab;
