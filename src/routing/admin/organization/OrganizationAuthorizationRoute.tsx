import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OrganizationAdminAuthorizationPage from '../../../pages/Admin/Organization/OrganizationAdminAuthorizationPage';
import OrganizationOwnerAuthorizationPage from '../../../pages/Admin/Organization/OrganizationOwnerAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OrganizationAuthorizationRouteProps extends AuthorizationRouteProps {}

const OrganizationAuthorizationRoute: FC<OrganizationAuthorizationRouteProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('./');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={'admins'} element={<OrganizationAdminAuthorizationPage paths={currentPaths} />}></Route>
      <Route path={'owners'} element={<OrganizationOwnerAuthorizationPage paths={currentPaths} />}></Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OrganizationAuthorizationRoute;
