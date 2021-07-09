import React, { FC } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import LoginPage from '../../pages/Authentication/LoginPage';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow');
  const redirect = params.get('redirect');

  if (!flow) {
    window.location.replace('/self-service/login/browser');
    return null;
  }

  return <LoginPage flow={flow} redirect={redirect ?? undefined} />;
};

export default LoginRoute;
