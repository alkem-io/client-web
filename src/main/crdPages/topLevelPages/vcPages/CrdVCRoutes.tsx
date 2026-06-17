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

const CrdVCSettingsRoutes = lazyWithGlobalErrorHandler(() => import('./settings/CrdVCSettingsRoutes'));
const CrdVCKnowledgeBasePage = lazyWithGlobalErrorHandler(() => import('./knowledgeBase/CrdVCKnowledgeBasePage'));

const VcSettingsDispatch = () => (
  <CrdLayoutWrapper>
    <Suspense fallback={<Loading />}>
      <CrdVCSettingsRoutes />
    </Suspense>
  </CrdLayoutWrapper>
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
          <CrdLayoutWrapper>
            <Suspense fallback={<Loading />}>
              <CrdVCKnowledgeBasePage />
            </Suspense>
          </CrdLayoutWrapper>
        }
      />
      <Route
        path="settings/*"
        element={
          <NoIdentityRedirect>
            <VcSettingsDispatch />
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
