import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import AdminAuthorizationPage from '../authorization/AdminAuthorizationPage';
import GlobalAuthorizationPage from '../authorization/GlobalAuthorizationPage';
import GlobalCommunityAuthorizationPage from '../authorization/GlobalCommunityAuthorizationPage';
import GlobalHubsAdminAuthorizationPage from '../authorization/GlobalHubsAdminAuthorizationPage';
import { nameOfUrl } from '../../../../core/routing/url-params';
import AuthorizationRouteProps from './AuthorizationRouteProps';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths, url]);

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
