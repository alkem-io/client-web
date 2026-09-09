import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useActionPermission, { type ActionPermission } from '@/domain/access/permissions/useActionPermission';
import {
  ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES,
  ROLE_SET_ASSIGN_PRIVILEGES,
  ROLE_SET_GRANT_PRIVILEGES,
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
   * Ticking the lead toggle on an ORGANIZATION row. `authorizeAssignOrganization` demands
   * the organization assign token AND grant, so this covers the assign direction only —
   * un-ticking it is a removal and resolves from `organizationRemove`.
   */
  organizationLeadAssign: ActionPermission;
  /**
   * Every `removeRoleFromOrganization` call: removing an ORGANIZATION from the space and
   * un-leading one alike. That resolver asks for grant alone, unlike its assign twin.
   */
  organizationRemove: ActionPermission;
  /** Add a virtual contributor — permitted by either token, never by both being required. */
  addVirtualContributor: ActionPermission;
};

const useCommunityActionPermissions = (
  myPrivileges: AuthorizationPrivilege[] | undefined,
  loading: boolean
): CommunityActionPermissions => {
  const addMember = useActionPermission(myPrivileges, ROLE_SET_ASSIGN_PRIVILEGES, loading);
  const grantAction = useActionPermission(myPrivileges, ROLE_SET_GRANT_PRIVILEGES, loading);
  const organizationAssign = useActionPermission(myPrivileges, ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES, loading);
  const vcFromAccount = useActionPermission(myPrivileges, VC_FROM_ACCOUNT_PRIVILEGES, loading);

  // Virtual contributors are permitted by EITHER the role-set assign privilege or the
  // account-assign privilege — space admins may hold only the latter. Mirrors the union in
  // `useCommunityAdmin`; requiring both would lock those admins out. The assign decision
  // supplies the reason so a still-loading union reads as "checking", not "denied".
  const addVirtualContributor = vcFromAccount.allowed ? vcFromAccount : addMember;

  return {
    addMember,
    userRoleChange: grantAction,
    addOrganization: organizationAssign,
    organizationLeadAssign: organizationAssign,
    organizationRemove: grantAction,
    addVirtualContributor,
  };
};

export default useCommunityActionPermissions;
