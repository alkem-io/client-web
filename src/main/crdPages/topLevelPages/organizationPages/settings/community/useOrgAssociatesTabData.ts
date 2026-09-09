import { ApolloError, useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationInfoDocument,
  useOrgAssociatesTabQuery,
  useUpdateOrganizationSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
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
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { ORG_ROLE_SET_MANAGE_PRIVILEGES } from '@/main/crdPages/permissions/roleAssignmentPrivileges';
import usePermissionReasonText from '@/main/crdPages/permissions/usePermissionReasonText';
import { offeredRoleLabelKey } from '@/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper';
import { mapRoleLimitError, mapUsersInRolesToAssociateRows, type OrgAssociateRow } from './orgAssociatesMapper';

export type PendingRoleRemoval = { contributorId: string; displayName: string };

const graphQLErrorInfo = (error: unknown): { code?: string; message?: string } => {
  if (!(error instanceof ApolloError)) return {};
  const first = error.graphQLErrors[0];
  return { code: first?.extensions?.code as string | undefined, message: first?.message };
};

const mapApplicationState = (state: string): PendingMembershipState | null => {
  switch (state) {
    case ApplicationState.NEW:
      return 'new';
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
  manageDisabledReason?: string;
  updating: boolean;
  onToggleRole: (contributorId: string, role: 'Associate' | 'Admin' | 'Owner', on: boolean) => Promise<void>;
  roleLimitError?: 'limitAdmin' | 'limitOwner' | 'minOwner';
  clearRoleLimitError: () => void;
  pendingRemove: PendingRoleRemoval | null;
  onRequestRemoveAll: (contributorId: string, displayName: string) => void;
  onConfirmRemoveAll: () => Promise<void>;
  onCancelRemoveAll: () => void;

  pendingMemberships: PendingMembership[];
  onPendingApprove: (id: string) => void;
  onPendingReject: (id: string) => void;
  onPendingRevoke: (id: string) => void;
  refetchPending: () => void;

  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;

  switches: {
    allowUsersMatchingDomainToJoin: boolean;
    allowApplications: boolean;
    saving: boolean;
    onToggleAllowDomain: (next: boolean) => Promise<void>;
    onToggleAllowApplications: (next: boolean) => Promise<void>;
  };
};

export const useOrgAssociatesTabData = (roleSetId: string | undefined): UseOrgAssociatesTabDataResult => {
  const { t } = useTranslation('crd-contributorSettings');
  const notify = useNotification();
  const apolloClient = useApolloClient();
  const { organization, organizationId } = useOrganizationContext();

  const { data, loading, refetch } = useOrgAssociatesTabQuery({
    variables: { roleSetId: roleSetId ?? '' },
    skip: !roleSetId,
  });
  const usersInRoles = data?.lookup.roleSet?.usersInRoles ?? [];
  const myPrivileges = data?.lookup.roleSet?.authorization?.myPrivileges;
  const associates = mapUsersInRolesToAssociateRows(usersInRoles, RoleName.Associate, RoleName.Admin, RoleName.Owner);

  const reasonText = usePermissionReasonText();
  const managePermission = useActionPermission(myPrivileges, ORG_ROLE_SET_MANAGE_PRIVILEGES, loading);
  const manageDisabledReason = reasonText(managePermission);
  const canManage = managePermission.allowed;

  const {
    assignRoleToUser,
    removeRoleFromUser,
    loading: updating,
  } = useRoleSetManagerRolesAssignment({
    roleSetId,
    refetchRoleSetOnMutation: false,
  });

  const [roleLimitError, setRoleLimitError] = useState<'limitAdmin' | 'limitOwner' | 'minOwner' | undefined>(undefined);
  const [pendingRemove, setPendingRemove] = useState<PendingRoleRemoval | null>(null);
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
      if (code === 'ROLESET_POLICY_ROLE_LIMITS_VIOLATED') {
        setRoleLimitError(mapRoleLimitError(message));
      } else if (code !== 'FORBIDDEN' && code !== 'FORBIDDEN_POLICY') {
        // Authorization failures already surfaced their own toast (useRoleSetManagerRolesAssignment).
        notify(t('org.associates.errors.generic'), 'error');
      }
      throw error;
    }
  };

  const onRequestRemoveAll = (contributorId: string, displayName: string) =>
    setPendingRemove({ contributorId, displayName });
  const onCancelRemoveAll = () => setPendingRemove(null);
  const onConfirmRemoveAll = async () => {
    if (!pendingRemove) return;
    const row = associates.find(a => a.id === pendingRemove.contributorId);
    setPendingRemove(null);
    if (!row) return;
    try {
      // Owner → Admin → Associate: cascade so a demoted-then-removed row never
      // transiently violates the min-owner / requires-entry-role invariants.
      if (row.isOwner) await removeRoleFromUser(row.id, RoleName.Owner);
      if (row.isAdmin) await removeRoleFromUser(row.id, RoleName.Admin);
      if (row.isAssociate) await removeRoleFromUser(row.id, RoleName.Associate);
      await refetch();
      notify(t('org.associates.editor.removeSuccess', { name: row.displayName }), 'success');
    } catch {
      notify(t('org.associates.editor.removeError', { name: row.displayName }), 'error');
    }
  };

  // ---------- pending applications & invitations ----------
  const {
    applications,
    invitations,
    applicationStateChange,
    deleteInvitation,
    refetch: refetchApplicationsAndInvitations,
  } = useRoleSetApplicationsAndInvitations({ roleSetId });

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
        canDelete: state !== 'approved',
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
        // with no action anywhere in the product to clear the row.
        canDelete: true,
        offeredRoleLabel: t(`org.associates.pending.offeredRole.${offeredRoleLabelKey(inv.extraRoles)}`),
      };
    })
    .filter((x): x is PendingMembership => x !== null);

  const pendingMemberships: PendingMembership[] = [...applicationRows, ...invitationRows];

  const onPendingApprove = (id: string) => {
    void applicationStateChange(id, ApplicationEvent.APPROVE).then(() => refetchApplicationsAndInvitations());
  };
  const onPendingReject = (id: string) => {
    void applicationStateChange(id, ApplicationEvent.REJECT).then(() => refetchApplicationsAndInvitations());
  };
  const onPendingRevoke = (id: string) => {
    void deleteInvitation(id).then(() => refetchApplicationsAndInvitations());
  };

  // ---------- membership switches ----------
  const [updateSettings, { loading: savingSettings }] = useUpdateOrganizationSettingsMutation();
  const allowUsersMatchingDomainToJoin = organization?.settings?.membership.allowUsersMatchingDomainToJoin ?? false;
  const allowApplications = organization?.settings?.membership.allowApplications ?? true;

  const refreshOrganizationInfo = () => void apolloClient.refetchQueries({ include: [OrganizationInfoDocument] });

  const onToggleAllowDomain = async (next: boolean) => {
    if (!organizationId) return;
    try {
      await updateSettings({
        variables: {
          settingsData: {
            organizationID: organizationId,
            settings: { membership: { allowUsersMatchingDomainToJoin: next, allowApplications } },
          },
        },
      });
      refreshOrganizationInfo();
    } catch {
      notify(t('org.associates.switches.saveError'), 'error');
    }
  };

  const onToggleAllowApplications = async (next: boolean) => {
    if (!organizationId) return;
    try {
      await updateSettings({
        variables: {
          settingsData: {
            organizationID: organizationId,
            settings: {
              membership: { allowUsersMatchingDomainToJoin: allowUsersMatchingDomainToJoin, allowApplications: next },
            },
          },
        },
      });
      refreshOrganizationInfo();
    } catch {
      notify(t('org.associates.switches.saveError'), 'error');
    }
  };

  return {
    associates,
    loading,
    canManage,
    manageDisabledReason,
    updating,
    onToggleRole,
    roleLimitError,
    clearRoleLimitError: () => setRoleLimitError(undefined),
    pendingRemove,
    onRequestRemoveAll,
    onConfirmRemoveAll,
    onCancelRemoveAll,
    pendingMemberships,
    onPendingApprove,
    onPendingReject,
    onPendingRevoke,
    refetchPending: () => void refetchApplicationsAndInvitations(),
    inviteOpen,
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
    switches: {
      allowUsersMatchingDomainToJoin,
      allowApplications,
      saving: savingSettings,
      onToggleAllowDomain,
      onToggleAllowApplications,
    },
  };
};

export default useOrgAssociatesTabData;
