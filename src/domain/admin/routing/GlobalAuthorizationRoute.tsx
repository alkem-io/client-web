import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../pages';
import AdminAuthorizationPage from '../../../pages/Admin/AdminAuthorization/AdminAuthorizationPage';
import GlobalAuthorizationPage from '../../../pages/Admin/GlobalAuthorizationPage';
import GlobalCommunityAuthorizationPage from '../../../pages/Admin/GlobalCommunityAuthorizationPage';
import GlobalHubsAdminAuthorizationPage from '../../../pages/Admin/GlobalHubsAdminAuthorizationPage';
import { nameOfUrl } from '../../../core/routing/url-params';
import AuthorizationRouteProps from './AuthorizationRouteProps';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage paths={currentPaths} />} />
      <Route path={`:${nameOfUrl.role}`} element={<GlobalAuthorizationPage paths={currentPaths} />} />
      <Route
        path={`global-community/:${nameOfUrl.role}`}
        element={<GlobalCommunityAuthorizationPage paths={currentPaths} />}
      />
      <Route
        path={`global-hubs/:${nameOfUrl.role}`}
        element={<GlobalHubsAdminAuthorizationPage paths={currentPaths} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default GlobalAuthorizationRoute;
