import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../../pages';
import OrganisationAdminAuthorizationPage from '../../../pages/Admin/Organisation/OrganisationAdminAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import OrganizationOwnerAuthorizationPage from '../../../pages/Admin/Organisation/OrganizationOwnerAuthorizationPage';

interface OrganisationAuthorizationRouteProps extends AuthorizationRouteProps {}

const OrganisationAuthorizationRoute: FC<OrganisationAuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/admins`}>
        <OrganisationAdminAuthorizationPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/owners`}>
        <OrganizationOwnerAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default OrganisationAuthorizationRoute;
