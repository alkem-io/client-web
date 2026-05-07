import { useEffect } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import useCanEditUserSettings, { type UseCanEditUserSettingsResult } from '../useCanEditUserSettings';

export type UseUserSettingsAccessGuardArgs = {
  /** The profile being viewed (resolved by `useUserPageRouteContext`). */
  profileUserId: string | undefined;
  /** The slug used to build the public-profile redirect URL. */
  profileSlug: string | undefined;
};

/**
 * Wraps `useCanEditUserSettings` for the User Settings shell route boundary
 * (FR-010 / SC-008).
 *
 * When the predicate resolves to `canEditSettings === false`, navigates the
 * viewer to `/user/<slug>` (the public profile owned by sibling spec 096) —
 * no read-only fallback. The redirect uses `replace: true` so the back
 * button doesn't bounce the viewer back into the settings shell.
 *
 * Returns the predicate result so the consumer can also branch on it (e.g.
 * the Security tab visibility per FR-012).
 */
const useUserSettingsAccessGuard = ({
  profileUserId,
  profileSlug,
}: UseUserSettingsAccessGuardArgs): UseCanEditUserSettingsResult => {
  const navigate = useNavigate();
  const result = useCanEditUserSettings({ profileUserId });

  useEffect(() => {
    if (result.loading) return;
    if (!profileUserId) return;
    if (result.canEditSettings) return;
    if (!profileSlug) return;
    navigate(`/user/${profileSlug}`, { replace: true });
  }, [result.loading, result.canEditSettings, profileUserId, profileSlug, navigate]);

  return result;
};

export default useUserSettingsAccessGuard;
