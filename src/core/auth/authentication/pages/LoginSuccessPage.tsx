import { useEffect } from 'react';
import { resolveInternalReturnPath } from '@/core/utils/links';
import { clearAllGuestSessionData } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useReturnUrl } from '../utils/useSignUpReturnUrl';

export const LoginSuccessPage = () => {
  const { returnUrl, clearReturnUrl } = useReturnUrl();
  const platformOrigin = usePlatformOrigin();

  // We don't really need to use user info here on every login,
  // but user profile creation is triggered the first time the user logs in,
  // and this way we ensure the profile is created before the user is redirected to the returnUrl.
  // Probably this won't be needed once we refactor UserProvider
  // We could maybe do a lighter query here to check if the user has profile or not, and trigger the creation if needed.
  const { userModel, loading } = useCurrentUserContext();

  useEffect(() => {
    if (loading || !userModel) {
      return;
    }
    // The cookie is base-domain scoped, so any subdomain can plant a value in
    // it — resolve it to an in-platform path before navigating, and prefix the
    // apex ourselves. This route is apex-only, so a relative navigation is the
    // correct fallback when the platform origin is not yet known.
    const path = resolveInternalReturnPath(returnUrl, platformOrigin) ?? ROUTE_HOME;
    // Clear all guest session data (name, whiteboard URL) on successful authentication
    clearAllGuestSessionData();
    // Single-shot: the destination has been reached, so it must not survive to
    // hijack a later navigation.
    clearReturnUrl();
    globalThis.location.replace(`${platformOrigin ?? ''}${path}`);
  }, [returnUrl, userModel, loading, platformOrigin]);

  return null;
};

export default LoginSuccessPage;
