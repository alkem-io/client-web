import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../pages';
import ErrorRoute from './error';
import LoginRoute from './login';
import LogoutRoute from './logout';
import RecoveryRoute from './recovery';
import RegistrationRoute from './registration';
import SettingsRoute from './settings';
import VerifyRoute from './verify';

export const AuthRoute: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/login`}>
        <LoginRoute />
      </Route>
      <Route exact path={`${path}/logout`}>
        <LogoutRoute />
      </Route>
      <Route exact path={`${path}/registration`}>
        <RegistrationRoute />
      </Route>
      <Route exact path={`${path}/verify`}>
        <VerifyRoute />
      </Route>
      <Route exact path={`${path}/recovery`}>
        <RecoveryRoute />
      </Route>
      <Route exact path={`${path}/settings`}>
        <SettingsRoute />
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
