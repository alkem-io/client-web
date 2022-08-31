import React, { FC, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { STORAGE_KEY_RETURN_URL } from '../../../../models/constants';

interface LoginSuccessPageProps {}

export const LoginSuccessPage: FC<LoginSuccessPageProps> = () => {
  useEffect(
    () => () => {
      sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
    },
    []
  );

  const redirectUrl = sessionStorage.getItem(STORAGE_KEY_RETURN_URL) ?? '/';

  return <Navigate to={redirectUrl} />;
};

export default LoginSuccessPage;
