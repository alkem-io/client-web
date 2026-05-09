import { useSpacePrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';

/**
 * Gates the entire CRD Space Settings page on the user's `Update` privilege
 * for the resolved space:
 *
 * - **Anonymous users** → the privileges query returns `FORBIDDEN_POLICY` and
 *   `useRestrictedRedirect` throws a `NotAuthorizedError` whose `redirectUrl`
 *   the boundary's redirectUrl branch consumes — silent redirect to the
 *   sign-in page with `returnUrl` preserved.
 * - **Authenticated non-admins** → the query resolves with the user's
 *   privileges, `Update` is missing, and `useRestrictedRedirect` throws
 *   `NotAuthorizedError` (no redirect) — boundary renders the CRD forbidden
 *   page.
 * - **Authenticated admins** → privileges include `Update`, no throw, the
 *   page renders.
 *
 * Without this guard, the Space Settings chrome (URL field, Visibility, etc.)
 * renders for unauthorized users while the underlying tab queries silently
 * fail with `data: null`. See spec §"FR-019, FR-021" and the screenshot in
 * the original bug report.
 */
export function useSpaceSettingsAccessGuard(spaceId: string, scopeLoading: boolean): void {
  const { data, error } = useSpacePrivilegesQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  useRestrictedRedirect(
    { data, error, skip: scopeLoading || !spaceId },
    data => data.lookup.space?.authorization?.myPrivileges,
    { requiredPrivilege: AuthorizationPrivilege.Update }
  );
}
