import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../pages';
import ErrorRoute from './error';
import LoginRoute from './login';
import LogoutRoute from './logout';
import RegisterRoute from './register';

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
        <RegisterRoute />
      </Route>
      <Route exact path={`${path}/verify`}>
        <RegisterRoute />
      </Route>
      <Route exact path={`${path}/recovery`}>
        <RegisterRoute />
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
