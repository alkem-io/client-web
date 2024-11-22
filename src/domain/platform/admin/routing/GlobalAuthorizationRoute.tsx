import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminAuthorizationPage from '../authorization/AdminAuthorizationPage';
import { AuthorizationCredential } from '@/core/apollo/generated/graphql-schema';

const GlobalAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminAuthorizationPage />} />
      <Route
        path={`roles/${AuthorizationCredential.GlobalAdmin}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.GlobalAdmin} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.GlobalSupport}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.GlobalSupport} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.GlobalLicenseManager}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.GlobalLicenseManager} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.GlobalCommunityRead}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.GlobalCommunityRead} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.GlobalSpacesReader}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.GlobalSpacesReader} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.BetaTester}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.BetaTester} />}
      />
      <Route
        path={`roles/${AuthorizationCredential.VcCampaign}`}
        element={<AdminAuthorizationPage credential={AuthorizationCredential.VcCampaign} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default GlobalAuthorizationRoute;
