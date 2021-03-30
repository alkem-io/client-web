import React, { FC, useContext, useMemo } from 'react';
import { Loading } from '../components/core/Loading';
import LoginPage from '../pages/LoginPage';
import { configContext } from '../context/ConfigProvider';
import { useEcoverse } from '../hooks/useEcoverse';
import { LOG_REFERNCE_NAME } from '../models/Constants';

export const LoginRoute: FC = () => {
  const { loading, config } = useContext(configContext);
  const ecoverse = useEcoverse();
  const logo = useMemo(
    () => ecoverse.ecoverse?.ecoverse.context?.references?.find(ref => ref.name === LOG_REFERNCE_NAME)?.uri,
    [ecoverse]
  );

  if (loading) {
    return <Loading text={'Loading config'} />;
  }
  return <LoginPage providers={config.authentication.providers} logo={logo} />;
};

export default LoginRoute;
