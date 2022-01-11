import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import { LOCAL_STORAGE_RETURN_URL_KEY, RETURN_URL } from '../../models/constants';
import LoginPage from '../../pages/Authentication/LoginPage';
import LoginSuccessPage from '../../pages/Authentication/LoginSuccessPage';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  const returnUrl = useQueryParams().get(RETURN_URL);

  if (returnUrl) {
    localStorage.setItem(LOCAL_STORAGE_RETURN_URL_KEY, returnUrl);
  }

  return (
    <Switch>
      <Route
        exact
        path={`${path}`}
        render={() => (
          <NotAuthenticatedRoute exact path={`${path}`}>
            <LoginPage flow={flow} />
          </NotAuthenticatedRoute>
        )}
      />

      <Route exact path={`${path}/success`}>
        <LoginSuccessPage />
      </Route>
    </Switch>
  );
};

export default LoginRoute;
