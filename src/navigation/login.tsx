import React, { FC, useContext } from 'react';
import { Loading } from '../components/core/Loading';
import LoginPage from '../components/LoginPage';
import { configContext } from '../context/ConfigProvider';

export const LoginRoute: FC = () => {
  const { loading, config } = useContext(configContext);
  if (loading) {
    return <Loading text={'Loading config'} />;
  }
  return <LoginPage providers={config.authentication.providers} />;
};
export default LoginRoute;
