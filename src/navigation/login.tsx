import React, { FC, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Loading } from '../components/core/Loading';
import { useConfig } from '../hooks/useConfig';
import { useEcoverse } from '../hooks/useEcoverse';
import { useQueryParams } from '../hooks/useQueryParams';
import { LOGO_REFERNCE_NAME } from '../models/Constants';
import LoginPage from '../pages/LoginPage';
import { hideLoginNavigation, showLoginNavigation } from '../reducers/ui/loginNavigation/actions';

export const LoginRoute: FC = () => {
  const { loading, authentication } = useConfig();
  const dispatch = useDispatch();
  const ecoverse = useEcoverse();
  const params = useQueryParams();
  const redirect = params.get('redirect');
  const logo = useMemo(
    () => ecoverse.ecoverse?.ecoverse.context?.references?.find(ref => ref.name === LOGO_REFERNCE_NAME)?.uri,
    [ecoverse]
  );

  useEffect(() => {
    dispatch(hideLoginNavigation());
    return () => {
      dispatch(showLoginNavigation());
    };
  }, []);

  if (loading) {
    return <Loading text={'Loading config'} />;
  }

  return <LoginPage providers={authentication.providers} logo={logo} redirect={redirect ?? undefined} />;
};

export default LoginRoute;
