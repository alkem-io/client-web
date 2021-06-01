import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQueryParams } from '../../hooks/useQueryParams';
import LoginPage from '../../pages/LoginPage';
import { hideLoginNavigation, showLoginNavigation } from '../../reducers/ui/loginNavigation/actions';

export const LoginRoute: FC = () => {
  const dispatch = useDispatch();
  const params = useQueryParams();
  const flow = params.get('flow');
  const redirect = params.get('redirect');

  useEffect(() => {
    dispatch(hideLoginNavigation());
    return () => {
      dispatch(showLoginNavigation());
    };
  }, []);

  if (!flow) {
    window.location.replace('/self-service/login/browser');
    return null;
  }

  return <LoginPage flow={flow} redirect={redirect ?? undefined} />;
};

export default LoginRoute;
