import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationInfoDocument,
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
  /**
   * Set after a successful accept whose response withheld an extra role. Belongs to that one
   * answer: reset when the next answer starts, hidden while another invitation is on screen,
   * and clearable from the dialog's close.
   */
  withheldNotice: string | undefined;
  clearWithheldNotice: () => void;
};

type WithheldNotice = { invitationId: string; message: string };

/**
 * Accept/decline for the invited user's OWN pending organization invitation, wherever it
 * is answered from (the organization profile hero, or the personal pending list). Shared
 * here so both call sites report the withheld-role notice identically.
 *
 * `currentInvitationId` is the invitation the caller is currently showing; when given, a
 * notice from a different invitation is never surfaced. Both callers close their dialog by
 * prop after an answer, which does not fire the dialog's own `onOpenChange`, so a notice
 * that only cleared there would greet the next invitation opened.
 */
export const useOrgInvitationResponse = (
  onSettled: () => void,
  currentInvitationId?: string
): UseOrgInvitationResponseResult => {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const [runEvent, { loading }] = useInvitationStateEventMutation();
  const [pendingAction, setPendingAction] = useState<'accept' | 'decline' | null>(null);
  const [withheldNotice, setWithheldNotice] = useState<WithheldNotice | undefined>(undefined);

  // OrganizationInfo too: the profile's associate action ("Respond to invitation") comes from
  // it, so answering from the top-bar pending dialog would otherwise leave that button stale,
  // pointing at an invitation the refetched pending list no longer has.
  const refetchQueries = [
    refetchUserPendingMembershipsQuery(),
    refetchPendingInvitationsCountQuery(),
    OrganizationInfoDocument,
  ];

  const respond = async (invitationId: string, eventName: InvitationEvent, action: 'accept' | 'decline') => {
    setPendingAction(action);
    setWithheldNotice(undefined);
    try {
      const result = await runEvent({
        variables: { invitationId, eventName },
        refetchQueries,
        awaitRefetchQueries: true,
        // Every outcome is reported below (inline notice, warning or error toast) — the
        // global error link must not add a second, generic toast.
        context: { skipGlobalErrorHandler: true },
      });
      const withheld = result.data?.eventOnInvitation.extraRolesWithheld;
      const withheldRole = withheld && withheldRoleKey(withheld);
      if (action === 'accept' && withheldRole) {
        const message = t('orgProfile.invitationDialog.withheld', {
          role: t(`orgProfile.invitationDialog.roleName.${withheldRole}`),
        });
        setWithheldNotice({ invitationId, message });
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

  const visibleNotice =
    withheldNotice && (currentInvitationId === undefined || withheldNotice.invitationId === currentInvitationId)
      ? withheldNotice.message
      : undefined;

  return {
    onAccept: invitationId => respond(invitationId, InvitationEvent.ACCEPT, 'accept'),
    onDecline: invitationId => respond(invitationId, InvitationEvent.REJECT, 'decline'),
    accepting: loading && pendingAction === 'accept',
    declining: loading && pendingAction === 'decline',
    withheldNotice: visibleNotice,
    clearWithheldNotice: () => setWithheldNotice(undefined),
  };
};
