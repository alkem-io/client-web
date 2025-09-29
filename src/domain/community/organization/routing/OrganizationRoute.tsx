import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import OrganizationPage from '../pages/OrganizationPage';
import OrganizationAdminRoutes from '@/domain/community/organizationAdmin/OrganizationAdminRoutes';
import { nameOfUrl } from '@/main/routing/urlParams';
import { OrganizationProvider } from '../context/OrganizationProvider';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';

const OrganizationProviderWithOutlet = () => (
  <OrganizationProvider>
    <OrganizationPageLayout />
  </OrganizationProvider>
);

const OrganizationRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<OrganizationProviderWithOutlet />}>
      <Route index element={<OrganizationPage />} />
      <Route path="settings/*" element={<OrganizationAdminRoutes />} />
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

export default OrganizationRoute;
