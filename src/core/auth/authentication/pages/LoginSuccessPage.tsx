import { useEffect } from 'react';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import { useReturnUrl } from '../utils/SignUpReturnUrl';
import { useCurrentUserContext } from '@/domain/community/user';

export const LoginSuccessPage = () => {
  const returnUrl = useReturnUrl();
  // We don't really need to use user info here on every login,
  // but user profile creation is triggered the first time the user logs in,
  // and this way we ensure the profile is created before the user is redirected to the returnUrl.
  // Probably this won't be needed once we refactor UserProvider
  // We could maybe do a lighter query here to check if the user has profile or not, and trigger the creation if needed.
  const { user, loading } = useCurrentUserContext();

  useEffect(() => {
    if (!loading && user) {
      if (returnUrl) {
        window.location.replace(returnUrl);
        return () => {
          sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
        };
      }
    }
  }, [returnUrl, user, loading]);

  return null;
};

export default LoginSuccessPage;
