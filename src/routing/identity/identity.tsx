import React, { FC, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useGlobalState } from '../../hooks';
import { Error404 } from '../../pages';
import AuthRequiredPage from '../../pages/Authentication/AuthRequiredPage';
import { HIDE_LOGIN_NAVIGATION, SHOW_LOGIN_NAVIGATION } from '../../state/global/ui/loginNavigationMachine';
import RestrictedRoute from '../RestrictedRoute';
import ErrorRoute from './ErrorRoute';
import LoginRoute from './LoginRoute';
import LogoutRoute from './LogoutRoute';
import RecoveryRoute from './RecoveryRoute';
import RegistrationRoute from './RegistrationRoute';
import SettingsRoute from './SettingsRoute';
import VerifyRoute from './VerifyRoute';

export const IdentityRoute: FC = () => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  useEffect(() => {
    loginNavigationService.send(HIDE_LOGIN_NAVIGATION);
    return () => {
      loginNavigationService.send(SHOW_LOGIN_NAVIGATION);
    };
  }, []);

  return (
    <>
      <Route path={'login'}>
        <LoginRoute />
      </Route>
      <Route path={'logout'}>
        <LogoutRoute />
      </Route>
      <Route path={'registration'}>
        <RegistrationRoute />
      </Route>
      <Route path={'verify'}>
        <VerifyRoute />
      </Route>
      <Route path={'recovery'}>
        <RecoveryRoute />
      </Route>
      <Route path={'settings'} element={<RestrictedRoute />}>
        <SettingsRoute />
      </Route>
      <Route path={'required'}>
        <AuthRequiredPage />
      </Route>
      <Route path={'error'}>
        <ErrorRoute />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </>
  );
};
