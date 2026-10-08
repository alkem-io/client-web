import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { getInitials } from '@/crd/lib/getInitials';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useAdminAccessGuard } from '@/main/crdPages/topLevelPages/admin/useAdminAccessGuard';

/**
 * The label shown under a user's name, keyed by role. Every key resolves in
 * `crd-common` (eagerly loaded) — the same fourteen strings also exist in
 * `crd-admin`, but that namespace is lazy and the layout renders before it.
 *
 * Full keys rather than suffixes: `t()` is typed against the literal key union,
 * so a template-built key does not type-check.
 */
const ROLE_LABEL_KEYS = {
  [RoleName.PlatformRolesAdmin]: 'common.roles.PLATFORM_ROLES_ADMIN',
  [RoleName.PlatformContentFullAccess]: 'common.roles.PLATFORM_CONTENT_FULL_ACCESS',
  [RoleName.PlatformResourceAdmin]: 'common.roles.PLATFORM_RESOURCE_ADMIN',
  [RoleName.PlatformSettingsAdmin]: 'common.roles.PLATFORM_SETTINGS_ADMIN',
  [RoleName.PlatformOperationsAdmin]: 'common.roles.PLATFORM_OPERATIONS_ADMIN',
  [RoleName.PlatformUsersAdmin]: 'common.roles.PLATFORM_USERS_ADMIN',
  [RoleName.PlatformSupport]: 'common.roles.PLATFORM_SUPPORT',
  [RoleName.PlatformLicenseManager]: 'common.roles.PLATFORM_LICENSE_MANAGER',
  [RoleName.PlatformSpacesReader]: 'common.roles.PLATFORM_SPACES_READER',
  [RoleName.PlatformAuditReader]: 'common.roles.PLATFORM_AUDIT_READER',
  [RoleName.FeatureBetaTester]: 'common.roles.FEATURE_BETA_TESTER',
  [RoleName.FeatureVirtualAssistant]: 'common.roles.FEATURE_VIRTUAL_ASSISTANT',
  [RoleName.FeatureOrganizationCreator]: 'common.roles.FEATURE_ORGANIZATION_CREATOR',
  [RoleName.FeatureVcCampaign]: 'common.roles.FEATURE_VC_CAMPAIGN',
} as const;

/**
 * Most-privileged first — a holder of several roles is labelled by the strongest.
 *
 * 027-platform-role-redesign (T014, Slice B): the five legacy entries are gone
 * from both this list and `ROLE_LABEL_KEYS`. The thirteen target roles are the
 * whole vocabulary now, so "most privileged" is a total order over them rather
 * than a mixed legacy/target ranking — which is what made the old order hard to
 * read: `global-admin` outranked everything while `platform-roles-admin`, the
 * role that actually replaced it, sat second.
 */
const ROLE_LABEL_PRECEDENCE: (keyof typeof ROLE_LABEL_KEYS)[] = [
  RoleName.PlatformRolesAdmin,
  RoleName.PlatformUsersAdmin,
  RoleName.PlatformSettingsAdmin,
  RoleName.PlatformOperationsAdmin,
  RoleName.PlatformResourceAdmin,
  RoleName.PlatformLicenseManager,
  RoleName.PlatformContentFullAccess,
  RoleName.PlatformSupport,
  RoleName.PlatformAuditReader,
  RoleName.PlatformSpacesReader,
  RoleName.FeatureOrganizationCreator,
  RoleName.FeatureVirtualAssistant,
  RoleName.FeatureBetaTester,
  RoleName.FeatureVcCampaign,
];

export function useCrdUser() {
  const { isAuthenticated, userModel, platformRoles } = useCurrentUserContext();
  const { t } = useTranslation();

  // spec-clientweb-5 (2026-07-31): the admin NAV entry gated solely on
  // `PLATFORM_ADMIN`, which is granted only to the legacy global-admin /
  // global-support / global-license-manager credentials — none of the
  // thirteen target roles receives it. The seeded break-glass Platform Roles
  // Admin could therefore reach the admin area (995579e71 widened the ROUTE
  // guard) but had no link to it, and no way to discover the page FR-012
  // makes the sole re-grant surface.
  //
  // Reuse the route guard's OWN decision rather than recomputing it. Sharing
  // the privilege constant was not enough: `hasPlatformPrivilege` reads only
  // `platform.authorization.myPrivileges` (CurrentUserProvider.tsx), while
  // `GRANT_GLOBAL_ADMINS` and `FEATURE_ROLE_ASSIGN` are granted on the
  // platform ROLE SET's policy. So every one of the thirteen roles evaluated
  // to false here and the nav entry stayed hidden even though the route guard
  // — which unions both policies — would have admitted them. Same set, wrong
  // source. Found live 2026-08-05 with a real `platform-roles-admin` holder.
  //
  // Apollo caches `PlatformLevelAuthorizationQuery`, so this shares the route
  // guard's in-flight request rather than issuing a second one.
  const { isPlatformAdmin } = useAdminAccessGuard();
  const isAdmin = isPlatformAdmin;

  // Every held role, precedence-ordered — filter the precedence list rather
  // than sort `platformRoles`, so the result never depends on the order the
  // API happened to return roles in (the defect the single label fixed on
  // 2026-08-05). Unmapped/retired roles simply do not survive the filter.
  //
  // The menu shows the head as the caption and the rest as a "+N" count: a
  // holder of Roles Admin AND Content Full Access — the combination the role
  // model exists to make visible — must not be silently collapsed to one.
  const roles = ROLE_LABEL_PRECEDENCE.filter(platformRole => platformRoles.includes(platformRole)).map(platformRole =>
    t(ROLE_LABEL_KEYS[platformRole])
  );
  const role: string | undefined = roles[0];

  const user = userModel?.profile
    ? {
        name: userModel.profile.displayName,
        avatarUrl: userModel.profile.avatar?.uri,
        initials: getInitials(userModel.profile.displayName),
        role,
        roles,
      }
    : undefined;

  return { user, userModel, isAuthenticated, isAdmin };
}
