import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from '../ui/layout/topLevelWrappers/App';
import { SpaceContextProvider } from '@/domain/journey/space/SpaceContext/SpaceContext';
import HomePage from '@/main/topLevelPages/Home/HomePage';
import { Error404 } from '@/core/pages/Errors/Error404';
import { Restricted } from '@/core/routing/Restricted';
import { nameOfUrl } from './urlParams';
import { IdentityRoute } from '@/core/auth/authentication/routing/IdentityRoute';
import { WithApmTransaction } from '@/domain/shared/components/WithApmTransaction/WithApmTransaction';
import devRoute from '@/dev/routes';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import RedirectToLanding from '@/domain/platform/routes/RedirectToLanding';
import NonIdentity from '@/domain/platform/routes/NonIdentity';
import useRedirectToIdentityDomain from '@/core/auth/authentication/routing/useRedirectToIdentityDomain';
import { EntityPageLayoutHolder, NotFoundPageLayout, RenderPoint } from '@/domain/journey/common/EntityPageLayout';
import RedirectToWelcomeSite from '@/domain/platform/routes/RedirectToWelcomeSite';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import Loading from '@/core/ui/loading/Loading';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const DocumentationPage = lazyWithGlobalErrorHandler(() => import('@/domain/documentation/DocumentationPage'));
const SpaceExplorerPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/topLevelSpaces/SpaceExplorerPage')
);
const InnovationLibraryPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryPage')
);
const ContributorsPage = lazyWithGlobalErrorHandler(() => import('@/domain/community/user/ContributorsPage'));
const AdminRoute = lazyWithGlobalErrorHandler(() => import('@/domain/platform/admin/routing/AdminRoute'));
const UserRoute = lazyWithGlobalErrorHandler(() => import('@/domain/community/user/routing/UserRoute'));
const OrganizationRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/organization/routing/OrganizationRoute')
);
const VCRoute = lazyWithGlobalErrorHandler(() => import('@/domain/community/virtualContributor/VCRoute'));
const ForumRoute = lazyWithGlobalErrorHandler(() => import('@/domain/communication/discussion/routing/ForumRoute'));
const InnovationPackRoute = lazyWithGlobalErrorHandler(() => import('@/domain/InnovationPack/InnovationPackRoute'));
const InnovationHubsRoutes = lazyWithGlobalErrorHandler(
  () => import('@/domain/innovationHub/InnovationHubsSettings/InnovationHubsRoutes')
);
const CreateSpaceDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/journey/space/createSpace/CreateSpaceDialog')
);
const SpaceRoute = lazyWithGlobalErrorHandler(() => import('@/domain/journey/space/routing/SpaceRoute'));

export const TopLevelRoutes = () => {
  useRedirectToIdentityDomain();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WithApmTransaction path="/">
            <App />
          </WithApmTransaction>
        }
      >
        <Route index element={<RedirectToLanding />} />
        <Route path={TopLevelRoutePath._Landing} element={<RedirectToWelcomeSite />} />
        <Route
          path={TopLevelRoutePath.CreateSpace}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.CreateSpace}>
                <>
                  <HomePage />
                  <Suspense fallback={<Loading />}>
                    <CreateSpaceDialog />
                  </Suspense>
                </>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={TopLevelRoutePath.Home}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.Home}>
                <HomePage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`:${nameOfUrl.spaceNameId}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.spaceNameId}/*`}>
                <SpaceContextProvider>
                  <EntityPageLayoutHolder>
                    <Suspense fallback={<Loading />}>
                      <SpaceRoute />
                    </Suspense>
                    <RenderPoint />
                  </EntityPageLayoutHolder>
                </SpaceContextProvider>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Admin}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path="/admin/*">
                <Suspense fallback={<Loading />}>
                  <AdminRoute />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        {IdentityRoute()}
        <Route
          path={`/${TopLevelRoutePath.User}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.userNameId}/*`}>
                <NoIdentityRedirect>
                  <Suspense fallback={<Loading />}>
                    <UserRoute />
                  </Suspense>
                </NoIdentityRedirect>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.VirtualContributor}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.vcNameId}/*`}>
                <NoIdentityRedirect>
                  <Suspense fallback={<Loading />}>
                    <VCRoute />
                  </Suspense>
                </NoIdentityRedirect>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Organization}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.organizationNameId}/*`}>
                <Suspense fallback={<Loading />}>
                  <OrganizationRoute />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.InnovationLibrary}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.InnovationLibrary}`}>
                <Suspense fallback={<Loading />}>
                  <InnovationLibraryPage />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`${TopLevelRoutePath.InnovationPacks}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.InnovationPacks}>
                <Suspense fallback={<Loading />}>
                  <InnovationPackRoute />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`${TopLevelRoutePath.InnovationHubs}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.InnovationHubs}>
                <Suspense fallback={<Loading />}>
                  <InnovationHubsRoutes />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`${TopLevelRoutePath.Docs}/*`}
          element={
            <Suspense fallback={<Loading />}>
              <DocumentationPage />
            </Suspense>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Spaces}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Spaces}`}>
                <Suspense fallback={<Loading />}>
                  <SpaceExplorerPage />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Contributors}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Contributors}`}>
                <Suspense fallback={<Loading />}>
                  <ContributorsPage />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Forum}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Forum}`}>
                <Suspense fallback={<Loading />}>
                  <ForumRoute />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Restricted}`}
          element={
            <WithApmTransaction path={`/${TopLevelRoutePath.Restricted}`}>
              <Restricted />
            </WithApmTransaction>
          }
        />
        <Route
          path="*"
          element={
            <WithApmTransaction path="*">
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            </WithApmTransaction>
          }
        />
        {devRoute()}
      </Route>
    </Routes>
  );
};
