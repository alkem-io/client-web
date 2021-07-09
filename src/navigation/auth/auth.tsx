import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../pages';
import { hideLoginNavigation, showLoginNavigation } from '../../reducers/ui/loginNavigation/actions';
import ErrorRoute from './error';
import LoginRoute from './login';
import LogoutRoute from './logout';
import RecoveryRoute from './recovery';
import RegistrationRoute from './registration';
import SettingsRoute from './settings';
import VerifyRoute from './verify';

export const AuthRoute: FC = () => {
  const { path } = useRouteMatch();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hideLoginNavigation());
    return () => {
      dispatch(showLoginNavigation());
    };
  }, []);

  return (
    <Switch>
      <Route exact path={`${path}/login`}>
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
