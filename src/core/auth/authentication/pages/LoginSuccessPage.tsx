import { useEffect } from 'react';
import { useGetReturnUrl } from '../utils/useSignUpReturnUrl';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { clearAllGuestSessionData } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';

export const LoginSuccessPage = () => {
  const returnUrl = useGetReturnUrl();

  // We don't really need to use user info here on every login,
  // but user profile creation is triggered the first time the user logs in,
  // and this way we ensure the profile is created before the user is redirected to the returnUrl.
  // Probably this won't be needed once we refactor UserProvider
  // We could maybe do a lighter query here to check if the user has profile or not, and trigger the creation if needed.
  const { userModel, loading } = useCurrentUserContext();

  useEffect(() => {
    if (!loading && userModel && returnUrl) {
      // Clear all guest session data (name, whiteboard URL) on successful authentication
      clearAllGuestSessionData();
      globalThis.location.replace(returnUrl);
    }
  }, [returnUrl, userModel, loading]);

  return null;
};

export default LoginSuccessPage;
