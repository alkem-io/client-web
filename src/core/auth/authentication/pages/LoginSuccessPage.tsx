import { FC, useEffect } from 'react';
import { STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';

interface LoginSuccessPageProps {}

export const LoginSuccessPage: FC<LoginSuccessPageProps> = () => {
  useEffect(() => {
    const redirectUrl = sessionStorage.getItem(STORAGE_KEY_RETURN_URL) ?? '/';

    window.location.replace(redirectUrl);

    return () => {
      sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
    };
  }, []);

  return null;
};

export default LoginSuccessPage;
