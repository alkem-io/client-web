import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OrganizationProfilePage from './OrganizationProfilePage';
import { OrganizationGroupsRoute } from './OrganizationGroupsRoute';
import OrganizationCommunityPage from './OrganizationCommunityPage';
import OrganizationAuthorizationPage from './OrganizationAuthorizationPage';
import NonAdminRedirect from '../../../../main/admin/NonAdminRedirect';
import { useOrganization } from '../../../community/contributor/organization/hooks/useOrganization';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';

const OrganizationAdminRoutes: FC = () => {
  const { organization, loading } = useOrganization();

  return (
    <NonAdminRedirect
      privileges={organization?.authorization?.myPrivileges}
      adminPrivilege={AuthorizationPrivilege.Update}
      loading={loading}
    >
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<OrganizationProfilePage />} />
        <Route path="community" element={<OrganizationCommunityPage />} />
        <Route path="community/groups/*" element={<OrganizationGroupsRoute />} />
        <Route path="authorization" element={<OrganizationAuthorizationPage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </NonAdminRedirect>
  );
};

export default OrganizationAdminRoutes;
