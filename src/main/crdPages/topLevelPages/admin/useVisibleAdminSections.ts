import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { ADMIN_SECTIONS, type AdminSectionDescriptor, type AdminSectionId } from './adminSections';

/**
 * Which admin sections may this user see?
 *
 * Before 027 the question did not arise: only `global-admin` reached the admin
 * area at all, and it could use every section. Decomposing that role means a
 * holder of, say, `platform-roles-admin` now reaches the area legitimately but
 * can only operate ONE section — while the nav offered all nine, every other
 * one leading to a page whose every action the server rejects.
 *
 * The mapping is derived from the feature's own privilege→role table
 * (`server/src/platform/platform-role/verification/privilege.grants.ts`), not
 * invented here, so a role gains a section exactly when it gains the privilege
 * that section's actions require.
 *
 * NOT a permission check. The server remains the only authority; this hides
 * affordances the user cannot use. Deep links still resolve — a hidden section
 * typed into the URL renders and its actions fail server-side, exactly as
 * before. Hiding a route as well would require predicting the server's answer,
 * which FR-012 forbids.
 */
type SectionPrivileges = Partial<Record<AdminSectionId, AuthorizationPrivilege[]>>;

const SECTION_ADMITTING_PRIVILEGES: SectionPrivileges = {
  // Role assignment — the surface FR-012 makes the sole re-grant path.
  authorization: [AuthorizationPrivilege.GrantGlobalAdmins, AuthorizationPrivilege.FeatureRoleAssign],
  // Authorization/licence resets are Platform Operations Admin's.
  'authorization-policies': [AuthorizationPrivilege.AuthorizationReset],
  users: [AuthorizationPrivilege.PlatformUsersAdmin],
  // Organizations, packs and hubs are org-owned resources — Platform Support.
  organizations: [AuthorizationPrivilege.PlatformSupportOrgResources, AuthorizationPrivilege.DeleteOrganization],
  'innovation-packs': [AuthorizationPrivilege.PlatformSupportOrgResources],
  'innovation-hubs': [AuthorizationPrivilege.PlatformSupportOrgResources],
  // Cross-account resource moves — Platform Resource Admin.
  transfer: [AuthorizationPrivilege.TransferResourceOffer, AuthorizationPrivilege.TransferResourceAccept],
  // ASSUMPTION (not spec-derived): these two have no single owning privilege in
  // the census, so they are admitted to the broad content/resource roles rather
  // than hidden. Erring toward showing — a wrongly hidden section is a support
  // ticket, a wrongly shown one is a failed click.
  spaces: [AuthorizationPrivilege.PlatformContentFullAccess],
  'virtual-contributors': [AuthorizationPrivilege.PlatformContentFullAccess],
};

/**
 * Sections admitted by ROLE rather than by privilege.
 *
 * The Transfer mapping above could never fire for the role that owns it:
 * `TRANSFER_RESOURCE_OFFER` / `_ACCEPT` are granted on **account** policies, so a
 * Platform Resource Admin's platform-level `myPrivileges` is legitimately empty
 * (live-assertion-run.md, finding F1). The privilege map stays — the legacy
 * `PLATFORM_ADMIN` holder and any future platform-anchored grant still match it —
 * and the role is checked in addition, never instead.
 *
 * Same narrow exception as `PLATFORM_ADMIN_AREA_ROLES`, and the two must stay in
 * step: a role admitted to the area with no visible section lands in an empty
 * shell, and a role granted a section it cannot reach is a dead entry.
 */
const SECTION_ADMITTING_ROLES: Partial<Record<AdminSectionId, RoleName[]>> = {
  transfer: [RoleName.PlatformResourceAdmin],
};

export const useVisibleAdminSections = (): {
  sections: readonly AdminSectionDescriptor[];
  loading: boolean;
} => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  // Both policies, for the same reason the route guard reads both: the
  // assignment privileges live on the platform ROLE SET, not on the platform.
  const held = new Set<AuthorizationPrivilege>([
    ...(data?.platform.authorization?.myPrivileges ?? []),
    ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
  ]);

  // The legacy catch-all keeps seeing everything. Slice A is additive: nobody
  // who can use a section today may lose sight of it.
  if (held.has(AuthorizationPrivilege.PlatformAdmin)) {
    return { sections: ADMIN_SECTIONS, loading };
  }

  const roles = new Set<RoleName>(data?.platform.roleSet.myRoles ?? []);

  const sections = ADMIN_SECTIONS.filter(section => {
    const admitting = SECTION_ADMITTING_PRIVILEGES[section.id];
    const admittingRoles = SECTION_ADMITTING_ROLES[section.id];
    // An unmapped section stays visible rather than vanishing — a section added
    // later must not silently disappear for every non-legacy admin.
    if (!admitting && !admittingRoles) {
      return true;
    }
    return (
      (admitting?.some(privilege => held.has(privilege)) ?? false) ||
      (admittingRoles?.some(role => roles.has(role)) ?? false)
    );
  });

  return { sections, loading };
};
