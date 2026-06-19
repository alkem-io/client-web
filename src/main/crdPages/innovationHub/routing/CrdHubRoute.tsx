import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { nameOfUrl } from '@/main/routing/urlParams';

const CrdInnovationHubHomePage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationHub/CrdInnovationHubHomePage')
);
const CrdInnovationHubSettingsPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationHub/CrdInnovationHubSettingsPage')
);

const CrdHubRoute = () => (
  <StorageConfigContextProvider locationType="platform">
    <Routes>
      <Route
        path={`:${nameOfUrl.innovationHubNameId}`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationHubHomePage />
          </Suspense>
        }
      />
      <Route path={`:${nameOfUrl.innovationHubNameId}/settings`} element={<Navigate to="about" replace={true} />} />
      <Route
        path={`:${nameOfUrl.innovationHubNameId}/settings/about`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationHubSettingsPage tab="about" />
          </Suspense>
        }
      />
      <Route
        path={`:${nameOfUrl.innovationHubNameId}/settings/spaces`}
        element={
          <Suspense fallback={<Loading />}>
            <CrdInnovationHubSettingsPage tab="spaces" />
          </Suspense>
        }
      />
      <Route path="*" element={<CrdNotFoundView />} />
    </Routes>
  </StorageConfigContextProvider>
);

export default CrdHubRoute;
