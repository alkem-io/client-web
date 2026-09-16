import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrgAssociatesTabQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type {
  PendingMembership,
  PendingMembershipContributorType,
  PendingMembershipState,
} from '@/crd/components/space/settings/PendingMembershipsTable';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useActionPermission from '@/domain/access/permissions/useActionPermission';
import useRoleSetManagerRolesAssignment from '@/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment';
import {
  ApplicationEvent,
  ApplicationState,
  InvitationState,
} from '@/domain/community/invitations/InvitationApplicationConstants';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import {
  ORG_ROLE_SET_MANAGE_PRIVILEGES,
  ROLE_SET_INVITE_PRIVILEGES,
} from '@/main/crdPages/permissions/roleAssignmentPrivileges';
import usePermissionReasonText from '@/main/crdPages/permissions/usePermissionReasonText';
import { offeredRoleLabelKey } from '@/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper';
import { mapRoleLimitError, mapUsersInRolesToAssociateRows, type OrgAssociateRow } from './orgAssociatesMapper';

export type PendingRoleRemoval = { contributorId: string; displayName: string };

/**
 * Everything on this tab that destroys something the admin cannot get back in a
 * click, routed through one confirmation. Golden Rule 9 covers removing a member,
 * a role, an application and an invitation alike, and the Space consumer of this
 * same pending table already confirms all of them.
 */
export type OrgPendingConfirmation =
  | { kind: 'removeAll'; id: string; displayName: string }
  | { kind: 'rejectApplication'; id: string; displayName: string }
  | { kind: 'revokeInvitation'; id: string; displayName: string };

const graphQLErrorInfo = (error: unknown): { code?: string; message?: string } => {
  if (!(error instanceof ApolloError)) return {};
  const first = error.graphQLErrors[0];
  return { code: first?.extensions?.code as string | undefined, message: first?.message };
};

// Authorization failures already surfaced their own toast (useRoleSetManagerRolesAssignment).
const isAuthorizationCode = (code: string | undefined) =>
  code === AlkemioGraphqlErrorCode.FORBIDDEN || code === AlkemioGraphqlErrorCode.FORBIDDEN_POLICY;

/**
 * Every mutation this tab owns renders its own failure (inline copy or one toast), so the
 * global error link must stay quiet for them — otherwise the admin sees two messages for
 * one refusal.
 */
const OWN_ERROR_HANDLING = { skipGlobalErrorHandler: true } as const;

/**
 * A transient `approving` / `accepting` row stays listed — the admin can see that the
 * answer is being processed — with every action disabled.
 */
const mapApplicationState = (state: string): PendingMembershipState | null => {
  switch (state) {
    case ApplicationState.NEW:
      return 'new';
    case ApplicationState.APPROVING:
      return 'approving';
    case ApplicationState.APPROVED:
      return 'approved';
    case ApplicationState.REJECTED:
      return 'rejected';
    default:
      return null;
  }
};

const mapInvitationState = (state: string): PendingMembershipState | null => {
  switch (state) {
    case InvitationState.INVITED:
      return 'invited';
    case InvitationState.ACCEPTING:
      return 'accepting';
    case InvitationState.ACCEPTED:
      return 'accepted';
    case InvitationState.REJECTED:
      return 'rejected';
    default:
      return null;
  }
};

const mapContributorType = (t: ActorType | undefined): PendingMembershipContributorType =>
  t === ActorType.Organization ? 'organization' : t === ActorType.VirtualContributor ? 'virtualContributor' : 'user';

export type UseOrgAssociatesTabDataResult = {
  associates: OrgAssociateRow[];
  loading: boolean;

  canManage: boolean;
  canInvite: boolean;
  inviteDisabledReason?: string;
  updating: boolean;
  onToggleRole: (contributorId: string, role: 'Associate' | 'Admin' | 'Owner', on: boolean) => Promise<void>;
  roleLimitError?: 'limitAdmin' | 'limitOwner' | 'minOwner';
  clearRoleLimitError: () => void;
  pendingConfirmation: OrgPendingConfirmation | null;
  onRequestRemoveAll: (contributorId: string, displayName: string) => void;
  onConfirm: () => Promise<void>;
  onCancelConfirmation: () => void;

  pendingMemberships: PendingMembership[];
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingRevoke: (id: string) => void;
  refetchPending: () => void;

  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;
};

export const useOrgAssociatesTabData = (roleSetId: string | undefined): UseOrgAssociatesTabDataResult => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();

  const { data, loading, refetch } = useOrgAssociatesTabQuery({
    variables: { roleSetId: roleSetId ?? '' },
    skip: !roleSetId,
  });
  const usersInRoles = data?.lookup.roleSet?.usersInRoles ?? [];
  const myPrivileges = data?.lookup.roleSet?.authorization?.myPrivileges;
  const associates = mapUsersInRolesToAssociateRows(usersInRoles, RoleName.Associate, RoleName.Admin, RoleName.Owner);

  const reasonText = usePermissionReasonText();
  const managePermission = useActionPermission(myPrivileges, ORG_ROLE_SET_MANAGE_PRIVILEGES, loading);
  const canManage = managePermission.allowed;
  // Inviting needs only the invite privilege, which GLOBAL_SUPPORT holds on every organization
  // role set without GRANT (R47) — so it is gated separately from the role editor.
  const invitePermission = useActionPermission(myPrivileges, ROLE_SET_INVITE_PRIVILEGES, loading);
  const inviteDisabledReason = reasonText(invitePermission);
  const canInvite = invitePermission.allowed;

  const {
    assignRoleToUser,
    removeRoleFromUser,
    loading: updating,
  } = useRoleSetManagerRolesAssignment({
    roleSetId,
    refetchRoleSetOnMutation: false,
    context: OWN_ERROR_HANDLING,
  });

  const [roleLimitError, setRoleLimitError] = useState<'limitAdmin' | 'limitOwner' | 'minOwner' | undefined>(undefined);
  const [pendingConfirmation, setPendingConfirmation] = useState<OrgPendingConfirmation | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const ROLE_TO_NAME: Record<'Associate' | 'Admin' | 'Owner', RoleName> = {
    Associate: RoleName.Associate,
    Admin: RoleName.Admin,
    Owner: RoleName.Owner,
  };

  const onToggleRole = async (contributorId: string, role: 'Associate' | 'Admin' | 'Owner', on: boolean) => {
    try {
      if (on) {
        await assignRoleToUser(contributorId, ROLE_TO_NAME[role]);
      } else {
        await removeRoleFromUser(contributorId, ROLE_TO_NAME[role]);
      }
      await refetch();
    } catch (error) {
      const { code, message } = graphQLErrorInfo(error);
      const limit = code === AlkemioGraphqlErrorCode.ROLESET_POLICY_ROLE_LIMITS_VIOLATED && mapRoleLimitError(message);
      if (limit) {
        setRoleLimitError(limit);
      } else if (!isAuthorizationCode(code)) {
        notify(t('org.associates.errors.generic'), 'error');
      }
      throw error;
    }
  };

  const onRequestRemoveAll = (contributorId: string, displayName: string) =>
    setPendingConfirmation({ kind: 'removeAll', id: contributorId, displayName });
  const onCancelConfirmation = () => setPendingConfirmation(null);

  const confirmRemoveAll = async (contributorId: string) => {
    const row = associates.find(a => a.id === contributorId);
    if (!row) return;
    try {
      // Owner → Admin → Associate: cascade so a demoted-then-removed row never
      // transiently violates the min-owner / requires-entry-role invariants.
      if (row.isOwner) await removeRoleFromUser(row.id, RoleName.Owner);
      if (row.isAdmin) await removeRoleFromUser(row.id, RoleName.Admin);
      if (row.isAssociate) await removeRoleFromUser(row.id, RoleName.Associate);
      await refetch();
      notify(t('org.associates.editor.removeSuccess', { name: row.displayName }), 'success');
    } catch (error) {
      const { code, message } = graphQLErrorInfo(error);
      const limit = code === AlkemioGraphqlErrorCode.ROLESET_POLICY_ROLE_LIMITS_VIOLATED && mapRoleLimitError(message);
      if (limit) {
        // Removing the last owner is refused by the role policy: say which limit, not "couldn't remove".
        notify(t(`org.associates.errors.${limit}`), 'error');
      } else if (!isAuthorizationCode(code)) {
        notify(t('org.associates.editor.removeError', { name: row.displayName }), 'error');
      }
    }
  };

  // ---------- pending applications & invitations ----------
  const {
    applications,
    invitations,
    applicationStateChange,
    deleteInvitation,
    refetch: refetchApplicationsAndInvitations,
  } = useRoleSetApplicationsAndInvitations({
    // Wait for the privileges, then select `applications` only with GRANT: the server gates that
    // field on GRANT, and for an inviter without it the error would null the whole role set —
    // emptying the invitations list too.
    roleSetId: myPrivileges ? roleSetId : undefined,
    includeApplications: canManage,
    mutationContext: OWN_ERROR_HANDLING,
  });

  const applicationRows: PendingMembership[] = applications
    .map<PendingMembership | null>(app => {
      const state = mapApplicationState(app.state);
      if (!state) return null;
      return {
        id: app.id,
        type: 'application',
        state,
        contributorType: mapContributorType(app.contributorType),
        displayName: app.actor.profile?.displayName ?? '',
        email: app.actor.profile?.email,
        url: app.actor.profile?.url,
        createdDate: app.createdDate ? new Date(app.createdDate).toISOString() : '',
        canApprove: state === 'new',
        canReject: state === 'new',
        // Revoke deletes an INVITATION. An application is dismissed by rejecting
        // it, which is the adjacent control; offering the trash here only fired
        // the invitation mutation with an application id.
        canDelete: false,
      };
    })
    .filter((x): x is PendingMembership => x !== null);

  const invitationRows: PendingMembership[] = invitations
    .map<PendingMembership | null>(inv => {
      const state = mapInvitationState(inv.state);
      if (!state) return null;
      return {
        id: inv.id,
        type: 'invitation',
        state,
        contributorType: mapContributorType(inv.contributorType),
        displayName: inv.actor.profile?.displayName ?? '',
        email: inv.actor.profile?.email,
        url: inv.actor.profile?.url,
        createdDate: inv.createdDate ? new Date(inv.createdDate).toISOString() : '',
        canApprove: false,
        canReject: false,
        // Every invitation row is removable, matching the Space side
        // (`useCommunityTabData`). This is not cosmetic: 061 deliberately removed the
        // lifecycle's REINVITE transition, so the ONLY sanctioned way to re-invite
        // someone who declined is to remove the declined invitation and invite again —
        // which re-runs the opt-out, the role-cap check and the notification. Gating
        // removal on `INVITED` alone left a declined user permanently un-invitable,
        // with no action anywhere in the product to clear the row. The one
        // exception is the transient 'accepting' row, whose answer is in flight.
        canDelete: state !== 'accepting',
        offeredRoleLabel: t(`org.associates.pending.offeredRole.${offeredRoleLabelKey(inv.extraRoles)}`),
      };
    })
    .filter((x): x is PendingMembership => x !== null);

  const pendingMemberships: PendingMembership[] = [...applicationRows, ...invitationRows];

  const onPendingApprove = (id: string) => {
    void applicationStateChange(id, ApplicationEvent.APPROVE)
      .then(() => refetchApplicationsAndInvitations())
      .catch(() => notify(t('org.associates.pending.actionError'), 'error'));
  };
  const nameOfPendingRow = (id: string) => pendingMemberships.find(m => m.id === id)?.displayName ?? '';

  const onPendingReject = (id: string) =>
    setPendingConfirmation({ kind: 'rejectApplication', id, displayName: nameOfPendingRow(id) });
  const onPendingRevoke = (id: string) =>
    setPendingConfirmation({ kind: 'revokeInvitation', id, displayName: nameOfPendingRow(id) });

  const onConfirm = async () => {
    const confirmation = pendingConfirmation;
    if (!confirmation) return;
    setPendingConfirmation(null);
    if (confirmation.kind === 'removeAll') {
      await confirmRemoveAll(confirmation.id);
      return;
    }
    try {
      // Dispatch on what the row IS. `deleteInvitation` on an application id
      // fails server-side, and an unhandled rejection means the admin clicks
      // again and again with nothing on screen changing.
      if (confirmation.kind === 'rejectApplication') {
        await applicationStateChange(confirmation.id, ApplicationEvent.REJECT);
      } else {
        await deleteInvitation(confirmation.id);
      }
      await refetchApplicationsAndInvitations();
    } catch {
      notify(t('org.associates.pending.actionError'), 'error');
    }
  };

  return {
    associates,
    loading,
    canManage,
    canInvite,
    inviteDisabledReason,
    updating,
    onToggleRole,
    roleLimitError,
    clearRoleLimitError: () => setRoleLimitError(undefined),
    pendingConfirmation,
    onRequestRemoveAll,
    onConfirm,
    onCancelConfirmation,
    pendingMemberships,
    onPendingApprove,
    onPendingReject,
    onPendingRevoke,
    refetchPending: () => void refetchApplicationsAndInvitations(),
    inviteOpen,
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
  };
};

export default useOrgAssociatesTabData;
