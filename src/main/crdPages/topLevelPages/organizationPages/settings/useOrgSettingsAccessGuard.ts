import { useEffect } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import useCanEditOrganizationSettings, {
  type UseCanEditOrganizationSettingsResult,
} from '../useCanEditOrganizationSettings';

export type UseOrgSettingsAccessGuardArgs = {
  /**
   * The organization's canonical public-profile URL (`organization.profile.url`).
   * Used directly as the redirect target on access denial — never built from a
   * `nameID` here. See `docs/crd/migration-guide.md` "URL Construction".
   */
  profileUrl: string | undefined;
};

/**
 * Wraps `useCanEditOrganizationSettings` for the Org Settings shell route
 * boundary (FR-011 / SC-009).
 *
 * When the predicate resolves to `canEditSettings === false`, navigates the
 * viewer to the organization's public profile (owned by sibling spec 096) —
 * no read-only fallback.
 */
const useOrgSettingsAccessGuard = ({
  profileUrl,
}: UseOrgSettingsAccessGuardArgs): UseCanEditOrganizationSettingsResult => {
  const navigate = useNavigate();
  const result = useCanEditOrganizationSettings();

  useEffect(() => {
    if (result.loading) return;
    if (result.canEditSettings) return;
    if (!profileUrl) return;
    navigate(profileUrl, { replace: true });
  }, [result.loading, result.canEditSettings, profileUrl, navigate]);

  return result;
};

export default useOrgSettingsAccessGuard;
