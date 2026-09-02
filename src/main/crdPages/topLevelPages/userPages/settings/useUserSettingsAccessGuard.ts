import { useEffect } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import useCanEditUserSettings, { type UseCanEditUserSettingsResult } from '../useCanEditUserSettings';

export type UseUserSettingsAccessGuardArgs = {
  /** The profile being viewed (resolved by `useUserPageRouteContext`). */
  profileUserId: string | undefined;
  /**
   * The user's canonical public-profile URL (`user.profile.url`, mapped
   * through `getProfileUrl` for the `/user/me` case). Used directly as the
   * redirect target on access denial — never built from a `nameID` here. See
   * `docs/crd/migration-guide.md` "URL Construction".
   */
  profileUrl: string | undefined;
};

/**
 * Wraps `useCanEditUserSettings` for the User Settings shell route boundary
 * (FR-010 / SC-008).
 *
 * When the predicate resolves to `canEditSettings === false`, navigates the
 * viewer to the user's public profile (owned by sibling spec 096) — no
 * read-only fallback. The redirect uses `replace: true` so the back button
 * doesn't bounce the viewer back into the settings shell.
 *
 * Returns the predicate result so the consumer can also branch on it (e.g.
 * the Security tab visibility per FR-012).
 */
const useUserSettingsAccessGuard = ({
  profileUserId,
  profileUrl,
}: UseUserSettingsAccessGuardArgs): UseCanEditUserSettingsResult => {
  const navigate = useNavigate();
  const result = useCanEditUserSettings({ profileUserId });

  useEffect(() => {
    if (result.loading) return;
    if (!profileUserId) return;
    if (result.canEditSettings) return;
    if (!profileUrl) return;
    navigate(profileUrl, { replace: true });
  }, [result.loading, result.canEditSettings, profileUserId, profileUrl, navigate]);

  return result;
};

export default useUserSettingsAccessGuard;
