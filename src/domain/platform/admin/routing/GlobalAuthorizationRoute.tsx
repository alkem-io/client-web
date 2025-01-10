import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminAuthorizationPage from '../authorization/AdminAuthorizationPage';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const GlobalAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage />} />
      <Route path={`roles/${RoleName.GlobalAdmin}`} element={<AdminAuthorizationPage role={RoleName.GlobalAdmin} />} />
      <Route
        path={`roles/${RoleName.GlobalSupport}`}
        element={<AdminAuthorizationPage role={RoleName.GlobalSupport} />}
      />
      <Route
        path={`roles/${RoleName.GlobalLicenseManager}`}
        element={<AdminAuthorizationPage role={RoleName.GlobalLicenseManager} />}
      />
      <Route
        path={`roles/${RoleName.GlobalCommunityReader}`}
        element={<AdminAuthorizationPage role={RoleName.GlobalCommunityReader} />}
      />
      <Route
        path={`roles/${RoleName.GlobalSpacesReader}`}
        element={<AdminAuthorizationPage role={RoleName.GlobalSpacesReader} />}
      />
      <Route
        path={`roles/${RoleName.PlatformBetaTester}`}
        element={<AdminAuthorizationPage role={RoleName.PlatformBetaTester} />}
      />
      <Route
        path={`roles/${RoleName.PlatformVcCampaign}`}
        element={<AdminAuthorizationPage role={RoleName.PlatformVcCampaign} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default GlobalAuthorizationRoute;
