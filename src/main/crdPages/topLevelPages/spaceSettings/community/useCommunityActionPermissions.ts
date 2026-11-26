import type { ActionPermission } from '@/domain/access/permissions/useActionPermission';
import type { CommunityGates } from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';

/**
 * One permission decision per control on the space Community settings surface.
 *
 * Each control is gated on the native verdict of the intent it runs (roleset-privileges,
 * community-roles-screens.tsv:186): `setRoles` on an existing holder needs GRANT on the space,
 * served as `SpaceCan.manageMembers`; `invite` needs INVITE, served as `SpaceCan.invite`; adding a
 * virtual contributor directly is admitted by the `candidates(entry: DIRECT)` picker verdict, which
 * the server decides (account agency is never inferred in the client).
 */
export type CommunityActionPermissions = {
  /** Lead toggle, admin toggle and remove-from-space on a USER row — `SpaceCan.manageMembers`. */
  userRoleChange: ActionPermission;
  /**
   * Ticking the lead toggle on an ORGANIZATION row — `SpaceCan.manageMembers`. Elevation of an actor
   * that already holds the entry role is gated by GRANT alone.
   */
  organizationLeadAssign: ActionPermission;
  /** Removing an ORGANIZATION from the space and un-leading one — `SpaceCan.manageMembers`. */
  organizationRemove: ActionPermission;
  /** Add a virtual contributor — the add-VC picker verdict. */
  addVirtualContributor: ActionPermission;
  /** Inviting an actor to the space — `SpaceCan.invite`. */
  invite: ActionPermission;
};

/**
 * Precedence mirrors `useActionPermission`: a read still in flight is `checking`, a verdict that
 * could not be read is `unverifiable`, otherwise the verdict decides. Every non-affirmative input
 * fails closed.
 */
const decide = (verdict: boolean | undefined, loading: boolean): ActionPermission => {
  if (loading) return { allowed: false, reason: 'checking' };
  if (verdict === undefined) return { allowed: false, reason: 'unverifiable' };
  return verdict ? { allowed: true, reason: 'allowed' } : { allowed: false, reason: 'denied' };
};

const useCommunityActionPermissions = (gates: CommunityGates): CommunityActionPermissions => {
  const manageMembers = decide(gates.manageMembers, gates.loading);

  return {
    userRoleChange: manageMembers,
    organizationLeadAssign: manageMembers,
    organizationRemove: manageMembers,
    addVirtualContributor: decide(gates.virtualContributorPicker, gates.virtualContributorPickerLoading),
    invite: decide(gates.invite, gates.loading),
  };
};

export default useCommunityActionPermissions;
