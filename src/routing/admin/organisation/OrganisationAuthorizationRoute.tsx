import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../../pages';
import OrganisationAuthorizationPage from '../../../pages/Admin/Organisation/OrganisationAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OrganisationAuthorizationRouteProps extends AuthorizationRouteProps {}

const OrganisationAuthorizationRoute: FC<OrganisationAuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:role`}>
        <OrganisationAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default OrganisationAuthorizationRoute;
