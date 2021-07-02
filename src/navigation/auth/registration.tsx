import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks/useQueryParams';
import RegistrationPage from '../../pages/Authentication/RegistrationPage';
import RegistrationSuccess from '../../pages/Authentication/RegistrationSuccess';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <RegistrationPage flow={flow} />;
      </Route>
      <Route exact path={`${path}/success`}>
        <RegistrationSuccess />
      </Route>
    </Switch>
  );
};
export default RegistrationRoute;
