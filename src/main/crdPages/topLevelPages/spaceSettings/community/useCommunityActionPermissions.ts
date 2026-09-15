import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActionPermission, { type ActionPermission } from '@/domain/access/permissions/useActionPermission';
import {
  ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES,
  ROLE_SET_ASSIGN_PRIVILEGES,
  ROLE_SET_GRANT_PRIVILEGES,
  ROLE_SET_INVITE_PRIVILEGES,
  VC_FROM_ACCOUNT_PRIVILEGES,
} from '@/main/crdPages/permissions/roleAssignmentPrivileges';

/**
 * One permission decision per control on the space Community settings surface.
 *
 * Which privilege gates which control is the whole point of this hook: the backend
 * resolver enforces a different token for adding a member than for changing an existing
 * member's roles, and pointing a control at the wrong one silently disables it for every
 * space admin. Keeping the map in one place makes each control's gate assertable instead
 * of being spread across the page's JSX.
 */
export type CommunityActionPermissions = {
  /** Add a USER to the member role — the direct-add path reserved for platform admins. */
  addMember: ActionPermission;
  /** Lead toggle, admin toggle and remove-from-space on a USER row. */
  userRoleChange: ActionPermission;
  /** Add an ORGANIZATION to the space. */
  addOrganization: ActionPermission;
  /**
   * Ticking the lead toggle on an ORGANIZATION row.
   *
   * GRANT, not the direct-add pair. `authorizeAssignOrganization` demands the
   * organization assign token only when the organization does NOT already hold the entry
   * role; for one that is already in the space it asks for grant alone (server ruling
   * R32). Consent is about ENTERING the space, not about which role the organization
   * holds once it is in. Gating this on the assign pair disabled the toggle for every
   * space admin, so an organization that accepted an invitation could never be given
   * Lead — the organization-shaped twin of the user bug #10280 fixed.
   */
  organizationLeadAssign: ActionPermission;
  /**
   * Every `removeRoleFromOrganization` call: removing an ORGANIZATION from the space and
   * un-leading one alike. That resolver asks for grant alone, unlike its assign twin.
   */
  organizationRemove: ActionPermission;
  /** Add a virtual contributor — permitted by either token, never by both being required. */
  addVirtualContributor: ActionPermission;
  /**
   * Inviting an actor to the space — `inviteForEntryRoleOnRoleSet`.
   *
   * A different token again: a space admin holds the invite privilege WITHOUT the
   * platform-admin direct-add pair, which is why the Invite organisation and Add
   * organisation buttons sitting beside each other are gated differently (FR-001).
   */
  invite: ActionPermission;
};

const useCommunityActionPermissions = (
  myPrivileges: AuthorizationPrivilege[] | undefined,
  loading: boolean
): CommunityActionPermissions => {
  const addMember = useActionPermission(myPrivileges, ROLE_SET_ASSIGN_PRIVILEGES, loading);
  const grantAction = useActionPermission(myPrivileges, ROLE_SET_GRANT_PRIVILEGES, loading);
  const organizationAssign = useActionPermission(myPrivileges, ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, loading);
  const vcFromAccount = useActionPermission(myPrivileges, VC_FROM_ACCOUNT_PRIVILEGES, loading);
  const invite = useActionPermission(myPrivileges, ROLE_SET_INVITE_PRIVILEGES, loading);

  // Virtual contributors are permitted by EITHER the role-set assign privilege or the
  // account-assign privilege — space admins may hold only the latter. Mirrors the union in
  // `useCommunityAdmin`; requiring both would lock those admins out. The assign decision
  // supplies the reason so a still-loading union reads as "checking", not "denied".
  const addVirtualContributor = vcFromAccount.allowed ? vcFromAccount : addMember;

  return {
    addMember,
    userRoleChange: grantAction,
    addOrganization: organizationAssign,
    organizationLeadAssign: grantAction,
    organizationRemove: grantAction,
    addVirtualContributor,
    invite,
  };
};

export default useCommunityActionPermissions;
