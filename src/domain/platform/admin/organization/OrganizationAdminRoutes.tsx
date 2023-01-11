import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OrganizationProfilePage from './OrganizationProfilePage';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import OrganizationCommunityPage from './OrganizationCommunityPage';
import OrganizationAuthorizationPage from './OrganizationAuthorizationPage';

const OrganizationAdminRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<OrganizationProfilePage />} />
      <Route path="community" element={<OrganizationCommunityPage />} />
      <Route path="community/groups/*" element={<OrganizationGroupsRoute />} />
      <Route path="authorization" element={<OrganizationAuthorizationPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OrganizationAdminRoutes;
