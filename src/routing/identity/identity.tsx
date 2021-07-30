import React, { FC, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useGlobalState } from '../../hooks';
import { FourOuFour } from '../../pages';
import AuthRequiredPage from '../../pages/Authentication/AuthRequiredPage';
import { HIDE_LOGIN_NAVIGATION, SHOW_LOGIN_NAVIGATION } from '../../state/global/ui/loginNavigationMachine';
import RestrictedRoute from '../route.extensions';
import ErrorRoute from './error';
import LoginRoute from './login';
import LogoutRoute from './logout';
import RecoveryRoute from './recovery';
import RegistrationRoute from './registration';
import SettingsRoute from './settings';
import VerifyRoute from './verify';

export const IdentityRoute: FC = () => {
  const { path } = useRouteMatch();

  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  useEffect(() => {
    loginNavigationService?.send(HIDE_LOGIN_NAVIGATION);
    return () => {
      loginNavigationService?.send(SHOW_LOGIN_NAVIGATION);
    };
  }, []);

  return (
    <Switch>
      <Route path={`${path}/login`}>
        <LoginRoute />
      </Route>
      <Route exact path={`${path}/logout`}>
        <LogoutRoute />
      </Route>
      <Route path={`${path}/registration`}>
        <RegistrationRoute />
      </Route>
      <Route path={`${path}/verify`}>
        <VerifyRoute />
      </Route>
      <Route exact path={`${path}/recovery`}>
        <RecoveryRoute />
      </Route>
      <RestrictedRoute exact path={`${path}/settings`}>
        <SettingsRoute />
      </RestrictedRoute>
      <Route exact path={`${path}/required`}>
        <AuthRequiredPage />
      </Route>
      <Route exact path={`${path}/error`}>
        <ErrorRoute />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
