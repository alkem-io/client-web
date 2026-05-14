import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import AdminInnovationPackPage from './admin/AdminInnovationPackPage';
import InnovationPackProfilePage from './InnovationPackProfilePage/InnovationPackProfilePage';

const CrdInnovationPackAdminPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationPack/CrdInnovationPackAdminPage')
);
const CrdInnovationPackProfilePage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationPack/CrdInnovationPackProfilePage')
);

// TODO the Innovationpack layout is too heavily coupled with the innovation pack so it's kept iniside the pages rather than here
// will revise ASAP
const InnovationPackRoute = () => {
  const crdEnabled = useCrdEnabled();
  return (
    <Routes>
      {crdEnabled ? (
        // CRD: public profile + admin BOTH wrapped in CrdLayoutWrapper. Anonymous access is preserved —
        // the public-profile routes are not behind an identity gate (FR-050).
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
      ) : (
        <>
          <Route path={`:${nameOfUrl.innovationPackNameId}`} element={<InnovationPackProfilePage />} />
          <Route
            path={`:${nameOfUrl.innovationPackNameId}/:${nameOfUrl.templateNameId}`}
            element={<InnovationPackProfilePage />}
          />
          <Route path={`:${nameOfUrl.innovationPackNameId}/settings`} element={<AdminInnovationPackPage />} />
          <Route
            path={`:${nameOfUrl.innovationPackNameId}/settings/:${nameOfUrl.templateNameId}`}
            element={<AdminInnovationPackPage />}
          />
        </>
      )}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default InnovationPackRoute;
