import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { resolveVisibleAdminSections } from './adminSectionAccess';
import type { AdminSectionDescriptor } from './adminSections';

/**
 * Which admin sections may this user see?
 *
 * The answer itself lives in `adminSectionAccess.ts` — per role, derived from
 * the server's own read gates — and is shared with the route guard so the nav
 * and the guard cannot disagree. This hook only supplies the two inputs.
 *
 * BOTH policies are read. The assignment and holder-read privileges are granted
 * on the platform ROLE SET's authorization, while PLATFORM_ADMIN,
 * PLATFORM_USERS_ADMIN and PLATFORM_CONTENT_FULL_ACCESS sit on the platform's
 * own. Reading only `platform.authorization` makes every one of the thirteen
 * roles look unprivileged — the defect that hid the nav entry entirely.
 *
 * `myRoles` rides the same cached query, so the role input costs no request.
 */
export const useVisibleAdminSections = (): {
  sections: readonly AdminSectionDescriptor[];
  loading: boolean;
} => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  const sections = resolveVisibleAdminSections({
    privileges: [
      ...(data?.platform.authorization?.myPrivileges ?? []),
      ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
    ],
    roles: data?.platform.roleSet.myRoles ?? [],
  });

  return { sections, loading };
};
