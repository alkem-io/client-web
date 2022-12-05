import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useOrganization } from '../../../community/contributor/organization/hooks/useOrganization';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OrganizationProfilePage from './OrganizationProfilePage';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import OrganizationCommunityPage from './OrganizationCommunityPage';
import OrganizationAuthorizationPage from './OrganizationAuthorizationPage';

const OrganizationAdminRoutes: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const { displayName } = useOrganization();

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName, real: true }],
    [paths, displayName, url]
  );

  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<OrganizationProfilePage paths={currentPaths} />} />
      <Route path="community" element={<OrganizationCommunityPage paths={currentPaths} />} />
      <Route path="community/groups/*" element={<OrganizationGroupsRoute paths={currentPaths} />} />
      <Route path="authorization" element={<OrganizationAuthorizationPage paths={currentPaths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OrganizationAdminRoutes;
