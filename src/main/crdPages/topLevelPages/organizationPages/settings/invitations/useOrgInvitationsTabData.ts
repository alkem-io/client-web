import { useState } from 'react';
import { useOrgInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
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
 * A failed accept or decline, including one for an invitation revoked (or an
 * admin demoted) between render and click, is reported by the global error
 * handler with the server's reason; the tab adds no message of its own.
 */
export const useOrgInvitationsTabData = (organizationId: string | undefined) => {
  const { data, loading, refetch } = useOrgInvitationsQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  });

  const [pendingAccept, setPendingAccept] = useState<PendingAction | null>(null);
  const [pendingDecline, setPendingDecline] = useState<PendingAction | null>(null);

  // The mutation's own `accepting`/`rejecting` flags go false the moment the
  // mutation resolves, which is BEFORE this tab's refetch lands. In that gap
  // the acted-on row is still on screen and still enabled, so a second click
  // fires a transition that no longer exists and the user gets an error toast
  // for an action that actually succeeded. Hold the busy state across the
  // refetch too.
  const [refreshing, setRefreshing] = useState(false);

  const { acceptInvitation, rejectInvitation, accepting, rejecting } = useInvitationActions({
    onUpdate: () => {
      setRefreshing(true);
      void refetch().finally(() => setRefreshing(false));
    },
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
      // Reported by the global error handler.
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
      // Reported by the global error handler.
    }
  };

  return {
    loading,
    rows,
    onRequestAccept,
    onRequestDecline,
    accepting: accepting || refreshing,
    rejecting: rejecting || refreshing,
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
