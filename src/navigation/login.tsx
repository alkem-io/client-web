import React, { FC, useContext } from 'react';
import { Loading } from '../components/core/Loading';
import { configContext } from '../context/ConfigProvider';
import { useQueryParams } from '../hooks/useQueryParams';
import LoginPage from '../pages/LoginPage';

export const LoginRoute: FC = () => {
  const { loading, config } = useContext(configContext);
  const params = useQueryParams();
  const redirect = params.get('redirect');

  if (loading) {
    return <Loading text={'Loading config'} />;
  }

  return <LoginPage providers={config.authentication.providers} redirect={redirect ?? undefined} />;
};
export default LoginRoute;
