import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { LOCAL_STORAGE_RETURN_URL_KEY } from '../../models/Constants';

interface LoginSuccessPageProps {}

export const LoginSuccessPage: FC<LoginSuccessPageProps> = () => {
  const redirectUrl = localStorage.getItem(LOCAL_STORAGE_RETURN_URL_KEY);

  if (redirectUrl) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_RETURN_URL_KEY);
    } catch {
      console.error('Can not remove key!');
    }
    return <Redirect to={redirectUrl} />;
  }
  return <Redirect to={'/'} />;
};
export default LoginSuccessPage;
