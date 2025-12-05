import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import OrganizationAdminProfilePage from './tabs/OrganizationAdminProfilePage';
import OrganizationAccountPage from './tabs/OrganizationAdminAccountPage';
import OrganizationAdminCommunityPage from './tabs/OrganizationAdminCommunityPage';
import OrganizationAdminAuthorizationPage from './tabs/OrganizationAdminAuthorizationPage';
import NonAdminRedirect from '@/main/admin/NonAdminRedirect';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { AuthorizationPrivilege, UrlType } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import OrganizationAdminSettingsPage from './tabs/OrganizationAdminSettingsPage';

const OrganizationAdminRoutes: FC = () => {
  const { organization, loading } = useOrganizationContext();

  if (loading) return <Loading />;

  if (!organization && !loading) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  return (
    <NonAdminRedirect
      privileges={organization?.authorization?.myPrivileges}
      adminPrivilege={AuthorizationPrivilege.Update}
      loading={loading}
      ancestorFallback={
        organization?.profile.url
          ? {
              type: UrlType.Organization,
              url: organization.profile.url,
            }
          : undefined
      }
    >
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<OrganizationAdminProfilePage />} />
        <Route path="account" element={<OrganizationAccountPage />} />
        <Route path="community" element={<OrganizationAdminCommunityPage />} />
        <Route path="authorization" element={<OrganizationAdminAuthorizationPage />} />
        <Route path="settings" element={<OrganizationAdminSettingsPage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </NonAdminRedirect>
  );
};

export default OrganizationAdminRoutes;
