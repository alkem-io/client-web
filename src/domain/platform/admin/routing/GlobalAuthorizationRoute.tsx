import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import AdminAuthorizationPage from '../authorization/AdminAuthorizationPage';
import GlobalAuthorizationPage from '../authorization/GlobalAuthorizationPage';
import GlobalCommunityViewerAuthorizationPage from '../authorization/GlobalCommunityAuthorizationPage';
import GlobalSupportAuthorizationPage from '../authorization/GlobalSpacesAdminAuthorizationPage';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import GlobalBetaTesterAuthorizationPage from '../authorization/GlobalBetaTesterAuthorizationPage';

const GlobalAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage />} />
      <Route path={`:${nameOfUrl.role}`} element={<GlobalAuthorizationPage />} />
      <Route path={`global-community-read/:${nameOfUrl.role}`} element={<GlobalCommunityViewerAuthorizationPage />} />
      <Route path={`global-support/:${nameOfUrl.role}`} element={<GlobalSupportAuthorizationPage />} />
      <Route path={`beta-tester/:${nameOfUrl.role}`} element={<GlobalBetaTesterAuthorizationPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default GlobalAuthorizationRoute;
