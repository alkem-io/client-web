import { Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { OrganizationProvider } from '@/domain/community/organization/context/OrganizationProvider';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdOrganizationProfilePage from './publicProfile/CrdOrganizationProfilePage';

const CrdOrgSettingsRoutes = lazyWithGlobalErrorHandler(() => import('./settings/CrdOrgSettingsRoutes'));
const CrdOrganizationCreatePage = lazyWithGlobalErrorHandler(() => import('./form/CrdOrganizationCreatePage'));

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
    {/* Static segment — react-router ranks it above `:organizationNameId`, so an
        organization whose nameID is literally "new" is the only casualty. */}
    <Route
      path="new"
      element={
        <CrdLayoutWrapper>
          <Suspense fallback={<Loading />}>
            <CrdOrganizationCreatePage />
          </Suspense>
        </CrdLayoutWrapper>
      }
    />
    <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<CrdOrganizationProviderWithOutlet />}>
      <Route index={true} element={<CrdOrganizationProfilePage />} />
      <Route path="settings/*" element={<OrgSettingsDispatch />} />
    </Route>
    <Route
      path="*"
      element={
        <CrdLayoutWrapper>
          <CrdNotFoundView />
        </CrdLayoutWrapper>
      }
    />
  </Routes>
);

export default CrdOrganizationRoutes;
