import React, { FC, useContext, useMemo } from 'react';
import { Loading } from '../components/core/Loading';
import { configContext } from '../context/ConfigProvider';
import { useEcoverse } from '../hooks/useEcoverse';
import { useQueryParams } from '../hooks/useQueryParams';
import { LOGO_REFERNCE_NAME } from '../models/Constants';
import LoginPage from '../pages/LoginPage';

export const LoginRoute: FC = () => {
  const { loading, config } = useContext(configContext);
  const ecoverse = useEcoverse();
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const logo = useMemo(
    () => ecoverse.ecoverse?.ecoverse.context?.references?.find(ref => ref.name === LOGO_REFERNCE_NAME)?.uri,
    [ecoverse]
  );

  if (loading) {
    return <Loading text={'Loading config'} />;
  }

  return <LoginPage providers={config.authentication.providers} logo={logo} redirect={redirect ?? undefined} />;
};

export default LoginRoute;
