import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OrganizationAdminAuthorizationPage from '../../../pages/Admin/Organization/OrganizationAdminAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import OrganizationOwnerAuthorizationPage from '../../../pages/Admin/Organization/OrganizationOwnerAuthorizationPage';

interface OrganizationAuthorizationRouteProps extends AuthorizationRouteProps {}

const OrganizationAuthorizationRoute: FC<OrganizationAuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route exact path={`${path}/admins`}>
        <OrganizationAdminAuthorizationPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/owners`}>
        <OrganizationOwnerAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default OrganizationAuthorizationRoute;
