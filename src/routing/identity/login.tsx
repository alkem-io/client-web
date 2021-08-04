import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import LoginPage from '../../pages/Authentication/LoginPage';
import LoginSuccessPage from '../../pages/Authentication/LoginSuccessPage';
import { NotAuthenticatedRoute } from '../route.extensions';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Switch>
      <NotAuthenticatedRoute exact path={`${path}`}>
        <LoginPage flow={flow} />
      </NotAuthenticatedRoute>
      <Route exact path={`${path}/success`}>
        <LoginSuccessPage />
      </Route>
    </Switch>
  );
};

export default LoginRoute;
