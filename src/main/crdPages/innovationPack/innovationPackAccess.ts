import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * Client mirrors of the server's dual-path gates on organization-owned
 * resources (027-platform-role-redesign, A7/A8 — `innovation.pack.resolver.mutations.ts`,
 * `innovation.hub.resolver.mutations.ts`). NOT permission checks: the server stays
 * the authority; these only decide which affordances to offer, so a viewer is
 * never handed an edit form or a delete button that can only fail (finding F9).
 */

/** `updateInnovationPack` / hub update: the owner's `Update`, or Platform Support's
 * `PlatformSupportOrgResources` (cascaded from an ORGANIZATION account only — a
 * user-hosted pack reports neither to Support, by FR-008(b)). */
export const canEditInnovationPack = (myPrivileges: readonly AuthorizationPrivilege[] | undefined): boolean =>
  (myPrivileges ?? []).some(
    p => p === AuthorizationPrivilege.Update || p === AuthorizationPrivilege.PlatformSupportOrgResources
  );

/** `deleteInnovationPack` / `deleteInnovationHub`: the owner's `Delete`, or Platform
 * Content Full Access (A8). Platform Support deliberately cannot delete the container. */
export const canDeleteOrgResource = (myPrivileges: readonly AuthorizationPrivilege[] | undefined): boolean =>
  (myPrivileges ?? []).some(
    p => p === AuthorizationPrivilege.Delete || p === AuthorizationPrivilege.PlatformContentFullAccess
  );
