import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import OrganizationAdminRoutes from '@/domain/community/organizationAdmin/OrganizationAdminRoutes';
import { nameOfUrl } from '@/main/routing/urlParams';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { OrganizationProvider } from '../context/OrganizationProvider';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPage from '../pages/OrganizationPage';

const OrganizationProviderWithOutlet = () => (
  <OrganizationProvider>
    <OrganizationPageLayout />
  </OrganizationProvider>
);

const OrganizationRoute = () => (
  <Routes>
    <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<OrganizationProviderWithOutlet />}>
      <Route index={true} element={<OrganizationPage />} />
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
