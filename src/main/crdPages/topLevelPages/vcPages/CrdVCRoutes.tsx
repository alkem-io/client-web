import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import Loading from '@/core/ui/loading/Loading';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import { nameOfUrl } from '@/main/routing/urlParams';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import CrdVCProfilePage from './publicProfile/CrdVCProfilePage';

const MuiVCSettingsRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/virtualContributorAdmin/VCSettingsRoute')
);
const MuiVCKnowledgeBaseRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/virtualContributor/knowledgeBase/VCKnowledgeBaseRoute')
);

export const CrdVCRoutes = () => (
  <Routes>
    <Route path={`:${nameOfUrl.vcNameId}/*`}>
      <Route
        index={true}
        element={
          <CrdLayoutWrapper>
            <CrdVCProfilePage />
          </CrdLayoutWrapper>
        }
      />
      <Route
        path={`${KNOWLEDGE_BASE_PATH}/*`}
        element={
          <Suspense fallback={<Loading />}>
            <MuiVCKnowledgeBaseRoute />
          </Suspense>
        }
      />
      <Route
        path="settings/*"
        element={
          <NoIdentityRedirect>
            <Suspense fallback={<Loading />}>
              <MuiVCSettingsRoute />
            </Suspense>
          </NoIdentityRedirect>
        }
      />
      <Route
        path="*"
        element={
          <CrdLayoutWrapper>
            <Error404 />
          </CrdLayoutWrapper>
        }
      />
    </Route>
  </Routes>
);

export default CrdVCRoutes;
