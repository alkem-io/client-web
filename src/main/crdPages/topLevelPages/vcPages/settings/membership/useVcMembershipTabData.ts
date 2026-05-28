import { useState } from 'react';
import {
  useInvitationStateEventMutation,
  useRemoveRoleFromVirtualContributorMutation,
  useSpaceContributionDetailsLazyQuery,
  useVcMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import useMembershipEnrichment from '@/main/crdPages/topLevelPages/userPages/settings/membership/useMembershipEnrichment';
import { collectSpaceIds, mapVcMembershipsToRows, mapVcPendingInvitationsToRows } from './vcMembershipMapper';

type PendingLeave = {
  membershipId: string;
  spaceId: string;
  displayName: string;
  type: 'space' | 'subspace';
};

type PendingAccept = {
  invitationId: string;
  spaceDisplayName: string;
  welcomeMessage: string | null;
};

/**
 * Integration hook for the VC Membership tab. Holds the UI state for the
 * Leave + Accept confirmation flows (Rule #9 / FR-172 / FR-173) and exposes
 * the rows + callbacks to the view.
 *
 * Per-row enrichment is reused from the User Membership stack — the existing
 * `useMembershipEnrichment` hook batches `useSpaceContributionDetailsQuery`
 * for any space id and is actor-agnostic (the query takes `spaceId` only).
 */
export const useVcMembershipTabData = (vcId: string | undefined) => {
  const { data, loading, refetch } = useVcMembershipsQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { virtualContributorId: vcId! },
    skip: !vcId,
  });

  const [fetchSpaceDetails] = useSpaceContributionDetailsLazyQuery();
  const [removeRole] = useRemoveRoleFromVirtualContributorMutation();
  const [invitationStateEvent] = useInvitationStateEventMutation();

  const spaceIds = collectSpaceIds(data);
  const enrichment = useMembershipEnrichment(spaceIds);
  const memberships = mapVcMembershipsToRows(data, enrichment);
  const pendingInvitations = mapVcPendingInvitationsToRows(data, vcId);

  const [pendingLeave, setPendingLeave] = useState<PendingLeave | null>(null);
  const [pendingAccept, setPendingAccept] = useState<PendingAccept | null>(null);

  const onRequestLeave = (membershipId: string) => {
    const row = memberships.find(r => r.id === membershipId);
    if (!row) return;
    setPendingLeave({
      membershipId,
      spaceId: row.spaceId,
      displayName: row.displayName || row.spaceId,
      type: row.type,
    });
  };

  const onCancelLeave = () => setPendingLeave(null);

  const onConfirmLeave = async () => {
    const pending = pendingLeave;
    if (!pending || !vcId) return;
    const result = await fetchSpaceDetails({ variables: { spaceId: pending.spaceId } });
    const roleSetId = result.data?.lookup.space?.about.membership.roleSetID;
    if (!roleSetId) {
      setPendingLeave(null);
      return;
    }
    await removeRole({
      variables: { contributorId: vcId, roleSetId, role: RoleName.Member },
      awaitRefetchQueries: true,
    });
    setPendingLeave(null);
    await refetch();
  };

  const onRequestAccept = (invitationId: string) => {
    const row = pendingInvitations.find(r => r.id === invitationId);
    if (!row) return;
    setPendingAccept({
      invitationId,
      spaceDisplayName: row.spaceDisplayName,
      welcomeMessage: row.welcomeMessage ?? null,
    });
  };

  const onCancelAccept = () => setPendingAccept(null);

  const onConfirmAccept = async () => {
    const pending = pendingAccept;
    if (!pending) return;
    await invitationStateEvent({
      variables: { eventName: 'ACCEPT', invitationId: pending.invitationId },
    });
    setPendingAccept(null);
    await refetch();
  };

  const onRequestDecline = async (invitationId: string) => {
    await invitationStateEvent({ variables: { eventName: 'REJECT', invitationId } });
    await refetch();
  };

  return {
    loading,
    memberships,
    pendingInvitations,
    onRequestLeave,
    onRequestAccept,
    onRequestDecline,
    leaveConfirm: {
      pendingId: pendingLeave?.membershipId ?? null,
      pendingDisplayName: pendingLeave?.displayName ?? null,
      pendingType: pendingLeave?.type ?? null,
      onConfirm: onConfirmLeave,
      onCancel: onCancelLeave,
    },
    acceptConfirm: {
      pendingId: pendingAccept?.invitationId ?? null,
      pendingSpaceName: pendingAccept?.spaceDisplayName ?? null,
      pendingWelcomeMessage: pendingAccept?.welcomeMessage ?? null,
      onConfirm: onConfirmAccept,
      onCancel: onCancelAccept,
    },
  };
};

export default useVcMembershipTabData;
