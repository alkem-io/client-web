import React, { FC, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
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
  const { path } = useRouteMatch();

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
      <Route
        exact
        path={`${path}/settings`}
        render={() => (
          <RestrictedRoute>
            <SettingsRoute />
          </RestrictedRoute>
        )}
      />

      <Route exact path={`${path}/required`}>
        <AuthRequiredPage />
      </Route>
      <Route exact path={`${path}/error`}>
        <ErrorRoute />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
