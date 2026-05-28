import { useInnovationHubByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export type HubAccessGuardResult =
  | { state: 'loading' }
  | { state: 'allowed' }
  | { state: 'denied'; redirectTo: string };

/**
 * Fetches the hub's `authorization.myPrivileges` (via the home fragment, which
 * carries privileges — the settings fragment does not). Returns:
 *   - `loading` while the privilege check is in flight
 *   - `allowed` when the viewer holds `Update`
 *   - `denied` with a redirect target (the hub's public home URL) otherwise
 *
 * Per FR-009 / FR-027b — the settings page MUST redirect non-admins to `/hub/<slug>`,
 * never render the form, never render a permission-denied page, never render read-only.
 */
export const useHubAccessGuard = (innovationHubId: string | undefined): HubAccessGuardResult => {
  const { data, loading } = useInnovationHubByIdQuery({
    variables: { id: innovationHubId! },
    skip: !innovationHubId,
  });

  if (loading || !innovationHubId) {
    return { state: 'loading' };
  }

  const hub = data?.platform.innovationHub;
  if (!hub) {
    return { state: 'loading' };
  }

  const canEdit = hub.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  if (canEdit) {
    return { state: 'allowed' };
  }

  return { state: 'denied', redirectTo: `/hub/${hub.nameID}` };
};
