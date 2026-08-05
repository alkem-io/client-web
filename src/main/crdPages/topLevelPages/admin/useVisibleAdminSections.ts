import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
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

  const sections = ADMIN_SECTIONS.filter(section => {
    const admitting = SECTION_ADMITTING_PRIVILEGES[section.id];
    // An unmapped section stays visible rather than vanishing — a section added
    // later must not silently disappear for every non-legacy admin.
    return !admitting || admitting.some(privilege => held.has(privilege));
  });

  return { sections, loading };
};
