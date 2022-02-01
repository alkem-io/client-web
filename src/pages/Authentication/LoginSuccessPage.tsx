import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { LOCAL_STORAGE_RETURN_URL_KEY } from '../../models/constants';
import { logger } from '../../services/logging/winston/logger';

interface LoginSuccessPageProps {}

export const LoginSuccessPage: FC<LoginSuccessPageProps> = () => {
  const redirectUrl = localStorage.getItem(LOCAL_STORAGE_RETURN_URL_KEY);

  if (redirectUrl) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_RETURN_URL_KEY);
    } catch {
      logger.error('Can not remove key!');
    }
    return <Navigate to={redirectUrl} />;
  }
  return <Navigate to={'/'} />;
};
export default LoginSuccessPage;
