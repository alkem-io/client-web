import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import Loading from '../../../../../core/ui/loading/Loading';
import { PageLayoutHolderWithOutlet } from '../../../../journey/common/EntityPageLayout';
import { useOrganization } from '../hooks/useOrganization';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import OrganizationPage from '../pages/OrganizationPage';
import TopLevelLayout from '../../../../../main/ui/layout/TopLevelLayout';
import OrganizationAdminRoutes from '../../../../platform/admin/organization/OrganizationAdminRoutes';

const OrganizationRoute: FC = () => {
  const { organization, loading } = useOrganization();

  if (loading) return <Loading />;

  if (!organization && !loading) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<OrganizationPage />} />
        <Route path="*" element={<Error404 />} />
        <Route path="settings/*" element={<OrganizationAdminRoutes />} />
      </Route>
    </Routes>
  );
};

export default OrganizationRoute;
