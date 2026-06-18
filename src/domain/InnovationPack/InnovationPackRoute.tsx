import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { CrdNotFoundBranch } from '@/main/crdPages/error/CrdNotFoundBranch';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

const CrdInnovationPackAdminPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationPack/CrdInnovationPackAdminPage')
);
const CrdInnovationPackProfilePage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationPack/CrdInnovationPackProfilePage')
);

const InnovationPackRoute = () => (
  <Routes>
    {/* Public profile + admin BOTH wrapped in CrdLayoutWrapper. Anonymous access is preserved —
        the public-profile routes are not behind an identity gate (FR-050). */}
    <Route element={<CrdLayoutWrapper />}>
      <Route
        path={`:${nameOfUrl.innovationPackNameId}`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationPackProfilePage />
          </Suspense>
        }
      />
      <Route
        path={`:${nameOfUrl.innovationPackNameId}/:${nameOfUrl.templateNameId}`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationPackProfilePage />
          </Suspense>
        }
      />
      <Route
        path={`:${nameOfUrl.innovationPackNameId}/settings`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationPackAdminPage />
          </Suspense>
        }
      />
      <Route
        path={`:${nameOfUrl.innovationPackNameId}/settings/:${nameOfUrl.templateNameId}`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationPackAdminPage />
          </Suspense>
        }
      />
    </Route>
    <Route path="*" element={<CrdNotFoundBranch />} />
  </Routes>
);
export default InnovationPackRoute;
