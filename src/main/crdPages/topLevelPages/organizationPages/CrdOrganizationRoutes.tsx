import { Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { OrganizationProvider } from '@/domain/community/organization/context/OrganizationProvider';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdOrganizationProfilePage from './publicProfile/CrdOrganizationProfilePage';

// Settings sub-tree — owned by spec 097. The CRD toggle picks between the
// new CRD shell and the existing MUI admin routes.
const CrdOrgSettingsRoutes = lazyWithGlobalErrorHandler(() => import('./settings/CrdOrgSettingsRoutes'));
const MuiOrganizationAdminRoutes = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/organizationAdmin/OrganizationAdminRoutes')
);

const OrgSettingsDispatch = () => {
  const crdEnabled = useCrdEnabled();
  return (
    <Suspense fallback={<Loading />}>{crdEnabled ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />}</Suspense>
  );
};

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
