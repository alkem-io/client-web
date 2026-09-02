import { useEffect } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import useCanEditVcSettings, { type UseCanEditVcSettingsResult } from '../useCanEditVcSettings';

export type UseVcSettingsAccessGuardArgs = {
  /** The VC's canonical id — drives the privilege check. */
  vcId: string | undefined;
  /**
   * The VC's canonical public-profile URL (`virtualContributor.profile.url`).
   * Used directly as the redirect target on access denial — never built from
   * a `nameID` here. See `docs/crd/migration-guide.md` "URL Construction".
   */
  profileUrl: string | undefined;
};

/**
 * Wraps `useCanEditVcSettings` for the VC Settings shell route boundary
 * (FR-013).
 *
 * When the predicate resolves to `canEditSettings === false`, navigates the
 * viewer to the VC's public profile (owned by sibling spec 096) — no
 * read-only fallback.
 */
const useVcSettingsAccessGuard = ({ vcId, profileUrl }: UseVcSettingsAccessGuardArgs): UseCanEditVcSettingsResult => {
  const navigate = useNavigate();
  const result = useCanEditVcSettings(vcId);

  useEffect(() => {
    if (result.loading) return;
    if (result.canEditSettings) return;
    if (!profileUrl) return;
    navigate(profileUrl, { replace: true });
  }, [result.loading, result.canEditSettings, profileUrl, navigate]);

  return result;
};

export default useVcSettingsAccessGuard;
