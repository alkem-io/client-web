import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OrganizationAdminAuthorizationPage from '../../../pages/Admin/Organization/OrganizationAdminAuthorizationPage';
import OrganizationOwnerAuthorizationPage from '../../../pages/Admin/Organization/OrganizationOwnerAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OrganizationAuthorizationRouteProps extends AuthorizationRouteProps {}

const OrganizationAuthorizationRoute: FC<OrganizationAuthorizationRouteProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={'admins'}>
        <OrganizationAdminAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path={'owners'}>
        <OrganizationOwnerAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default OrganizationAuthorizationRoute;
