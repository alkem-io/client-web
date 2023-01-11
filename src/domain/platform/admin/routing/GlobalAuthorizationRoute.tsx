import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import AdminAuthorizationPage from '../authorization/AdminAuthorizationPage';
import GlobalAuthorizationPage from '../authorization/GlobalAuthorizationPage';
import GlobalCommunityAuthorizationPage from '../authorization/GlobalCommunityAuthorizationPage';
import GlobalHubsAdminAuthorizationPage from '../authorization/GlobalHubsAdminAuthorizationPage';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import AuthorizationRouteProps from './AuthorizationRouteProps';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage />} />
      <Route path={`:${nameOfUrl.role}`} element={<GlobalAuthorizationPage />} />
      <Route path={`global-community/:${nameOfUrl.role}`} element={<GlobalCommunityAuthorizationPage />} />
      <Route path={`global-hubs/:${nameOfUrl.role}`} element={<GlobalHubsAdminAuthorizationPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default GlobalAuthorizationRoute;
