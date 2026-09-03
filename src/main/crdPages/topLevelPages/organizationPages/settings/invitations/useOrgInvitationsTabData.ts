import { useState } from 'react';
import { useOrgInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { mapOrgInvitations } from './orgInvitationsMapper';

type PendingAccept = {
  invitationId: string;
  spaceDisplayName: string;
};

/**
 * Integration hook for the organization Invitations tab. Clones the shape of
 * `vcPages/settings/membership/useVcMembershipTabData.ts`: accept goes
 * through a confirmation step (Rule #9), decline is direct. Reuses the
 * shared `useInvitationActions` accept/reject mutation wrapper (same
 * refetches — pending count, pending list — the personal dialog relies on)
 * and additionally refetches this tab's own query on every state change.
 */
export const useOrgInvitationsTabData = (organizationId: string | undefined) => {
  const { data, loading, refetch } = useOrgInvitationsQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  });

  const [pendingAccept, setPendingAccept] = useState<PendingAccept | null>(null);

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

  const onConfirmAccept = () => {
    const pending = pendingAccept;
    if (!pending) return;
    setPendingAccept(null);
    // Organization invitations never navigate on accept — they resolve in place.
    acceptInvitation(pending.invitationId, '');
  };

  const onDecline = (invitationId: string) => {
    rejectInvitation(invitationId);
  };

  return {
    loading,
    rows,
    onRequestAccept,
    onDecline,
    accepting,
    rejecting,
    acceptConfirm: {
      pendingId: pendingAccept?.invitationId ?? null,
      pendingSpaceName: pendingAccept?.spaceDisplayName ?? null,
      onConfirm: onConfirmAccept,
      onCancel: onCancelAccept,
    },
  };
};

export default useOrgInvitationsTabData;
