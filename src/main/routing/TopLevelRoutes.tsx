import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IdentityRoute } from '@/core/auth/authentication/routing/IdentityRoute';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import RedirectToLanding from '@/domain/platform/routes/RedirectToLanding';
import RedirectToWelcomeSite from '@/domain/platform/routes/RedirectToWelcomeSite';
import { CrdNotFoundBranch } from '@/main/crdPages/error/CrdNotFoundBranch';
import { CrdRestrictedRoute } from '@/main/crdPages/error/CrdRestrictedRoute';
import CrdSpaceRoutes from '@/main/crdPages/space/routing/CrdSpaceRoutes';
import CrdSpaceExplorerPage from '@/main/crdPages/spaces/SpaceExplorerPage';
import { CrdLayoutWrapper } from '../ui/layout/CrdLayoutWrapper';
import App from '../ui/layout/topLevelWrappers/App';
import { reservedTopLevelRoutePaths, TopLevelRoutePath } from './TopLevelRoutePath';
import { nameOfUrl } from './urlParams';
import { UrlResolverProvider } from './urlResolver/UrlResolverProvider';

const DashboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/dashboard/DashboardPage'));
const RedirectDocumentation = lazyWithGlobalErrorHandler(() => import('@/main/documentation/RedirectDocumentation'));
const CrdDocumentationPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/documentation/CrdDocumentationPage')
);

export const TopLevelRoutes = () => (
  <Routes>
    <Route path="/" element={<App />}>
      {IdentityRoute()}
      <Route index={true} element={<RedirectToLanding />} />
      <Route path={TopLevelRoutePath._Landing} element={<RedirectToWelcomeSite />} />
      <Route
        path={`${TopLevelRoutePath.Docs}/*`}
        element={
          <CrdLayoutWrapper>
            <Suspense fallback={<Loading />}>
              <CrdDocumentationPage />
            </Suspense>
          </CrdLayoutWrapper>
        }
      />
      <Route
        path={`${TopLevelRoutePath.Documentation}/*`}
        element={
          <Suspense fallback={<Loading />}>
            <RedirectDocumentation />
          </Suspense>
        }
      />
      <Route path={TopLevelRoutePath.Restricted} element={<CrdRestrictedRoute />} />
      <Route path={TopLevelRoutePath.Help} element={<Navigate to={`/${TopLevelRoutePath.Docs}`} />} />
      <Route path={TopLevelRoutePath.About} element={<Navigate to={`/${TopLevelRoutePath.Docs}`} />} />
      <Route
        path={TopLevelRoutePath.Spaces}
        element={
          <CrdLayoutWrapper>
            <Suspense fallback={<Loading />}>
              <CrdSpaceExplorerPage />
            </Suspense>
          </CrdLayoutWrapper>
        }
      />
      <Route
        path={TopLevelRoutePath.Home}
        element={
          <CrdLayoutWrapper>
            <Suspense fallback={<Loading />}>
              <DashboardPage />
            </Suspense>
          </CrdLayoutWrapper>
        }
      />
      {reservedTopLevelRoutePaths
        .filter(path => path !== TopLevelRoutePath.Home)
        .map(path => (
          <Route key={path} path={`${path}/*`} element={<CrdNotFoundBranch />} />
        ))}
      <Route
        path="*"
        element={
          <CrdLayoutWrapper>
            <Suspense fallback={<Loading />}>
              <UrlResolverProvider>
                <Routes>
                  <Route path={`:${nameOfUrl.spaceNameId}/*`} element={<CrdSpaceRoutes />} />
                </Routes>
              </UrlResolverProvider>
            </Suspense>
          </CrdLayoutWrapper>
        }
      />
    </Route>
  </Routes>
);
