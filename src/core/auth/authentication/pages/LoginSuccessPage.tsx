import { FC, useEffect } from 'react';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import { useReturnUrl } from '../utils/SignUpReturnUrl';

interface LoginSuccessPageProps {}

export const LoginSuccessPage: FC<LoginSuccessPageProps> = () => {
  const returnUrl = useReturnUrl();
  useEffect(() => {
    if (returnUrl) {
      window.location.replace(returnUrl);
      return () => {
        sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
      };
    }
  }, [returnUrl]);

  return null;
};

export default LoginSuccessPage;
