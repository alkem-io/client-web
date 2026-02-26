import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminAuthorizationPage from '../management/authorization/AdminAuthorizationPage';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const GlobalAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage />} />
      <Route
        path={`roles/${RoleName.GlobalAdmin}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalAdmin} />}
      />
      <Route
        path={`roles/${RoleName.GlobalSupport}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalSupport} />}
      />
      <Route
        path={`roles/${RoleName.GlobalLicenseManager}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalLicenseManager} />}
      />
      <Route
        path={`roles/${RoleName.GlobalCommunityReader}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalCommunityReader} />}
      />
      <Route
        path={`roles/${RoleName.GlobalSpacesReader}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalSpacesReader} />}
      />
      <Route
        path={`roles/${RoleName.GlobalPlatformManager}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalPlatformManager} />}
      />
      <Route
        path={`roles/${RoleName.GlobalSupportManager}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.GlobalSupportManager} />}
      />
      <Route
        path={`roles/${RoleName.PlatformBetaTester}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.PlatformBetaTester} />}
      />
      <Route
        path={`roles/${RoleName.PlatformVcCampaign}`}
        element={<AdminAuthorizationPage selectedRole={RoleName.PlatformVcCampaign} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default GlobalAuthorizationRoute;
