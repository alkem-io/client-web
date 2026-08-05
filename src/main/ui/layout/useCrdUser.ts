import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { getInitials } from '@/crd/lib/getInitials';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useAdminAccessGuard } from '@/main/crdPages/topLevelPages/admin/useAdminAccessGuard';

/**
 * The label shown under a user's name, keyed by role. Every key resolves in
 * `crd-common` (eagerly loaded) — the same thirteen strings also exist in
 * `crd-admin`, but that namespace is lazy and the layout renders before it.
 *
 * Full keys rather than suffixes: `t()` is typed against the literal key union,
 * so a template-built key does not type-check.
 */
const ROLE_LABEL_KEYS = {
  [RoleName.GlobalAdmin]: 'common.roles.GLOBAL_ADMIN',
  [RoleName.GlobalSupport]: 'common.roles.GLOBAL_SUPPORT',
  [RoleName.GlobalLicenseManager]: 'common.roles.GLOBAL_LICENSE_MANAGER',
  [RoleName.PlatformBetaTester]: 'common.roles.PLATFORM_BETA_TESTER',
  [RoleName.PlatformVcCampaign]: 'common.roles.PLATFORM_VC_CAMPAIGN',
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
} as const;

/** Most-privileged first — a holder of several roles is labelled by the strongest. */
const ROLE_LABEL_PRECEDENCE: (keyof typeof ROLE_LABEL_KEYS)[] = [
  RoleName.GlobalAdmin,
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
  RoleName.GlobalSupport,
  RoleName.GlobalLicenseManager,
  RoleName.FeatureOrganizationCreator,
  RoleName.FeatureVirtualAssistant,
  RoleName.FeatureBetaTester,
  RoleName.PlatformBetaTester,
  RoleName.PlatformVcCampaign,
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

  const role = (() => {
    // Precedence, not server order. The previous form iterated `platformRoles`
    // and returned the first match, which made the displayed label depend on
    // the order the API happened to return roles in — invisible while only one
    // role could realistically be held, ambiguous now that a user can hold
    // several of the thirteen at once. Most-privileged wins.
    //
    // The thirteen were absent entirely (2026-08-05): a `platform-roles-admin`
    // holder had NO label under their name while a legacy global admin did.
    for (const platformRole of ROLE_LABEL_PRECEDENCE) {
      if (platformRoles.includes(platformRole)) {
        return t(ROLE_LABEL_KEYS[platformRole]);
      }
    }
    return undefined;
  })();

  const user = userModel?.profile
    ? {
        name: userModel.profile.displayName,
        avatarUrl: userModel.profile.avatar?.uri,
        initials: getInitials(userModel.profile.displayName),
        role,
      }
    : undefined;

  return { user, userModel, isAuthenticated, isAdmin };
}
