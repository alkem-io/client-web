import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canUseAdminArea } from './adminSectionAccess';

/**
 * The current viewer's admin-area standing.
 *
 * `isPlatformAdmin` answers exactly one question — may this viewer enter the
 * admin area — and answers it from `adminSectionAccess`, the same module the
 * route guard (`NonPlatformAdminRedirect`) and the nav filter
 * (`useVisibleAdminSections`) read. That shared source is the point: this hook
 * is what places the Administration entry in the profile menu, and a menu that
 * disagrees with the guard produces either a dead link or an unreachable page.
 *
 * Both policies are unioned before asking. The assignment and holder-read
 * privileges sit on the platform ROLE SET's authorization; `PLATFORM_ADMIN`,
 * `PLATFORM_USERS_ADMIN` and `PLATFORM_CONTENT_FULL_ACCESS` sit on the
 * platform's own. Reading only the platform policy denies half the model.
 */
export const useAdminAccessGuard = () => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  const privileges = [
    ...(data?.platform.authorization?.myPrivileges ?? []),
    ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
  ];

  const isPlatformAdmin = canUseAdminArea({ privileges, roles: data?.platform.roleSet.myRoles });

  /**
   * May the viewer change another user's login email?
   *
   * A capability, NOT "is an admin". `adminUserEmailChange` is gated on
   * `PLATFORM_USERS_ADMIN` (plus the legacy catch-all) at its own resolver, so
   * deriving the affordance from admin-area access hands a Change Email button
   * to every other role that reaches the shell — a Platform Roles Admin today,
   * and Platform Content Full Access once the area admits it. The button then
   * opens a dialog whose submit the server always refuses, which is finding
   * F8's defect shape exactly: an editor offered to a role that can edit none.
   */
  const canChangeUserEmail = privileges.some(
    privilege =>
      privilege === AuthorizationPrivilege.PlatformUsersAdmin || privilege === AuthorizationPrivilege.PlatformAdmin
  );

  return { loading, isPlatformAdmin, canChangeUserEmail };
};
