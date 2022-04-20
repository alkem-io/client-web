import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useOrganization } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import OrganizationContextPage from './OrganizationContextPage';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import OrganizationCommunityPage from './OrganizationCommunityPage';
import OrganizationAuthorizationPage from './OrganizationAuthorizationPage';

const OrganizationAdminRoutes: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');

  const { displayName } = useOrganization();

  const currentPaths = useMemo(() => [...paths, { value: url, name: displayName, real: true }], [paths, displayName]);

  return (
    <Routes>
      <Route index element={<Navigate to="context" replace />} />
      <Route path="context" element={<OrganizationContextPage paths={currentPaths} />} />
      <Route path="community" element={<OrganizationCommunityPage paths={currentPaths} />} />
      <Route path="community/groups/*" element={<OrganizationGroupsRoute paths={currentPaths} />} />
      <Route path="authorization" element={<OrganizationAuthorizationPage paths={currentPaths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OrganizationAdminRoutes;
