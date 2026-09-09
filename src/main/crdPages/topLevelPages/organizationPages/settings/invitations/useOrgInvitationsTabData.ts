import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrgInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { mapOrgInvitations } from './orgInvitationsMapper';

type PendingAction = {
  invitationId: string;
  spaceDisplayName: string;
};

/**
 * Integration hook for the organization Invitations tab. Clones the shape of
 * `vcPages/settings/membership/useVcMembershipTabData.ts`: BOTH accept and
 * decline go through a confirmation step (Rule #9 — decline is irreversible
 * from this surface, see the view's prop docs). Reuses the
 * shared `useInvitationActions` accept/reject mutation wrapper (same
 * refetches — pending count, pending list — the personal dialog relies on)
 * and additionally refetches this tab's own query on every state change.
 *
 * Both mutations are awaited and their rejection handled here. The global
 * Apollo error link cannot be relied on for this surface: FORBIDDEN and
 * FORBIDDEN_POLICY are in EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS, and those are
 * exactly what an invitation revoked (or an admin demoted) between render and
 * click returns — leaving the row untouched and the user with no feedback at
 * all.
 */
export const useOrgInvitationsTabData = (organizationId: string | undefined) => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const { data, loading, refetch } = useOrgInvitationsQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  });

  const [pendingAccept, setPendingAccept] = useState<PendingAction | null>(null);
  const [pendingDecline, setPendingDecline] = useState<PendingAction | null>(null);

  const { acceptInvitation, rejectInvitation, accepting, rejecting } = useInvitationActions({
    onUpdate: () => void refetch(),
  });

  const rows = mapOrgInvitations(data, organizationId);

  const onRequestAccept = (invitationId: string) => {
    const row = rows.find(r => r.id === invitationId);
    if (!row) return;
    setPendingAccept({ invitationId, spaceDisplayName: row.spaceDisplayName });
  };

  const onCancelAccept = () => setPendingAccept(null);

  const onConfirmAccept = async () => {
    const pending = pendingAccept;
    if (!pending) return;
    setPendingAccept(null);
    try {
      // Organization invitations never navigate on accept — they resolve in place.
      await acceptInvitation(pending.invitationId, '');
    } catch {
      notify(t('org.invitations.errorToast'), 'error');
    }
  };

  const onRequestDecline = (invitationId: string) => {
    const row = rows.find(r => r.id === invitationId);
    if (!row) return;
    setPendingDecline({ invitationId, spaceDisplayName: row.spaceDisplayName });
  };

  const onCancelDecline = () => setPendingDecline(null);

  const onConfirmDecline = async () => {
    const pending = pendingDecline;
    if (!pending) return;
    setPendingDecline(null);
    try {
      await rejectInvitation(pending.invitationId);
    } catch {
      notify(t('org.invitations.errorToast'), 'error');
    }
  };

  return {
    loading,
    rows,
    onRequestAccept,
    onRequestDecline,
    accepting,
    rejecting,
    acceptConfirm: {
      pendingId: pendingAccept?.invitationId ?? null,
      pendingSpaceName: pendingAccept?.spaceDisplayName ?? null,
      onConfirm: () => void onConfirmAccept(),
      onCancel: onCancelAccept,
    },
    declineConfirm: {
      pendingId: pendingDecline?.invitationId ?? null,
      pendingSpaceName: pendingDecline?.spaceDisplayName ?? null,
      onConfirm: () => void onConfirmDecline(),
      onCancel: onCancelDecline,
    },
  };
};

export default useOrgInvitationsTabData;
