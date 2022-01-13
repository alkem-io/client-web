import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import RegistrationPage from '../../pages/Authentication/RegistrationPage';
import RegistrationSuccessPage from '../../pages/Authentication/RegistrationSuccessPage';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        exact
        path={`${path}`}
        render={() => (
          <NotAuthenticatedRoute>
            <RegistrationPage flow={flow} />
          </NotAuthenticatedRoute>
        )}
      />

      <Route exact path={`${path}/success`}>
        <RegistrationSuccessPage />
      </Route>
    </Switch>
  );
};
export default RegistrationRoute;
