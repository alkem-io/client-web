import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import RegistrationPage from '../../pages/Authentication/RegistrationPage';
import RegistrationSuccessPage from '../../pages/Authentication/RegistrationSuccessPage';
import { NotAuthenticatedRoute } from '../route.extensions';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Switch>
      <NotAuthenticatedRoute exact path={`${path}`}>
        <RegistrationPage flow={flow} />
      </NotAuthenticatedRoute>
      <Route exact path={`${path}/success`}>
        <RegistrationSuccessPage />
      </Route>
    </Switch>
  );
};
export default RegistrationRoute;
