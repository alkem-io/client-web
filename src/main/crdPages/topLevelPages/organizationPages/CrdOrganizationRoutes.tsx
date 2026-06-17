import { Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { OrganizationProvider } from '@/domain/community/organization/context/OrganizationProvider';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdOrganizationProfilePage from './publicProfile/CrdOrganizationProfilePage';

const CrdOrgSettingsRoutes = lazyWithGlobalErrorHandler(() => import('./settings/CrdOrgSettingsRoutes'));

const OrgSettingsDispatch = () => (
  <Suspense fallback={<Loading />}>
    <CrdOrgSettingsRoutes />
  </Suspense>
);

const CrdOrganizationProviderWithOutlet = () => (
  <OrganizationProvider>
    <CrdLayoutWrapper>
      <Outlet />
    </CrdLayoutWrapper>
  </OrganizationProvider>
);

export const CrdOrganizationRoutes = () => (
  <Routes>
    <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<CrdOrganizationProviderWithOutlet />}>
      <Route index={true} element={<CrdOrganizationProfilePage />} />
      <Route path="settings/*" element={<OrgSettingsDispatch />} />
    </Route>
    <Route
      path="*"
      element={
        <CrdLayoutWrapper>
          <Error404 />
        </CrdLayoutWrapper>
      }
    />
  </Routes>
);

export default CrdOrganizationRoutes;
