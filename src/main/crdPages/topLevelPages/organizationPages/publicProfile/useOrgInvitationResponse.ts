import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchPendingInvitationsCountQuery,
  refetchUserPendingMembershipsQuery,
  useInvitationStateEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { InvitationEvent } from '@/domain/community/invitations/InvitationApplicationConstants';

/** The withheld notice names the single elevated role that could not be granted. */
const withheldRoleKey = (extraRoles: RoleName[]): 'admin' | 'owner' | undefined => {
  if (extraRoles.includes(RoleName.Admin)) return 'admin';
  if (extraRoles.includes(RoleName.Owner)) return 'owner';
  return undefined;
};

export type UseOrgInvitationResponseResult = {
  onAccept: (invitationId: string) => Promise<void>;
  onDecline: (invitationId: string) => Promise<void>;
  accepting: boolean;
  declining: boolean;
  /** Set once, after a successful accept whose response withheld an extra role. Cleared on close. */
  withheldNotice: string | undefined;
  clearWithheldNotice: () => void;
};

/**
 * Accept/decline for the invited user's OWN pending organization invitation, wherever it
 * is answered from (the organization profile hero, or the personal pending list). Shared
 * here so both call sites report the withheld-role notice (FR-003) identically.
 */
export const useOrgInvitationResponse = (onSettled: () => void): UseOrgInvitationResponseResult => {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const [runEvent, { loading }] = useInvitationStateEventMutation();
  const [pendingAction, setPendingAction] = useState<'accept' | 'decline' | null>(null);
  const [withheldNotice, setWithheldNotice] = useState<string | undefined>(undefined);

  const refetchQueries = [refetchUserPendingMembershipsQuery(), refetchPendingInvitationsCountQuery()];

  const respond = async (invitationId: string, eventName: InvitationEvent, action: 'accept' | 'decline') => {
    setPendingAction(action);
    try {
      const result = await runEvent({
        variables: { invitationId, eventName },
        refetchQueries,
        awaitRefetchQueries: true,
      });
      const withheld = result.data?.eventOnInvitation.extraRolesWithheld;
      const withheldRole = withheld && withheldRoleKey(withheld);
      if (action === 'accept' && withheldRole) {
        const message = t('orgProfile.invitationDialog.withheld', {
          role: t(`orgProfile.invitationDialog.roleName.${withheldRole}`),
        });
        setWithheldNotice(message);
        // Also raise it as a notification, and do it BEFORE onSettled. Both call
        // sites implement onSettled as "close the dialog", and the refetch has
        // already removed this invitation from the pending list the dialog is
        // rendered from — so the inline notice unmounts in the same commit that
        // sets it and is never seen. Accepting and being silently downgraded to
        // a plain associate is the one outcome this must not do.
        notify(message, 'warning');
      }
      onSettled();
    } catch {
      notify(
        action === 'accept'
          ? t('orgProfile.invitationDialog.acceptError')
          : t('orgProfile.invitationDialog.declineError'),
        'error'
      );
    } finally {
      setPendingAction(null);
    }
  };

  return {
    onAccept: invitationId => respond(invitationId, InvitationEvent.ACCEPT, 'accept'),
    onDecline: invitationId => respond(invitationId, InvitationEvent.REJECT, 'decline'),
    accepting: loading && pendingAction === 'accept',
    declining: loading && pendingAction === 'decline',
    withheldNotice,
    clearWithheldNotice: () => setWithheldNotice(undefined),
  };
};
