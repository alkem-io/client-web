import { useEffect } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import useCanEditOrganizationSettings, {
  type UseCanEditOrganizationSettingsResult,
} from '../useCanEditOrganizationSettings';

export type UseOrgSettingsAccessGuardArgs = {
  /** The slug used to build the public-profile redirect URL. */
  organizationSlug: string | undefined;
};

/**
 * Wraps `useCanEditOrganizationSettings` for the Org Settings shell route
 * boundary (FR-011 / SC-009).
 *
 * When the predicate resolves to `canEditSettings === false`, navigates the
 * viewer to `/organization/<orgSlug>` (the public profile owned by sibling
 * spec 096) — no read-only fallback.
 */
const useOrgSettingsAccessGuard = ({
  organizationSlug,
}: UseOrgSettingsAccessGuardArgs): UseCanEditOrganizationSettingsResult => {
  const navigate = useNavigate();
  const result = useCanEditOrganizationSettings();

  useEffect(() => {
    if (result.loading) return;
    if (result.canEditSettings) return;
    if (!organizationSlug) return;
    navigate(`/organization/${organizationSlug}`, { replace: true });
  }, [result.loading, result.canEditSettings, organizationSlug, navigate]);

  return result;
};

export default useOrgSettingsAccessGuard;
