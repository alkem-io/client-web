import { Route, Routes } from 'react-router';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import OrganizationPage from '../pages/OrganizationPage';
import OrganizationAdminRoutes from '@/domain/community/organizationAdmin/OrganizationAdminRoutes';
import { nameOfUrl } from '@/main/routing/urlParams';
import { OrganizationProvider } from '../../contributor/organization/context/OrganizationProvider';
import { Outlet } from 'react-router-dom';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

const OrganizationProviderWithOutlet = withUrlResolverParams(() => (
  <OrganizationProvider>
    <Outlet />
  </OrganizationProvider>
));

const OrganizationRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<OrganizationProviderWithOutlet />}>
      <Route path="" element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<OrganizationPage />} />
        <Route path="settings/*" element={<OrganizationAdminRoutes />} />
      </Route>
    </Route>
    <Route
      path="*"
      element={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    />
  </Routes>
);

export default withUrlResolverParams(OrganizationRoute);
