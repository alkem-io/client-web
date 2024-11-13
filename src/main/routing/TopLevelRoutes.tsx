import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from '../ui/layout/topLevelWrappers/App';
import { CommunityContextProvider } from '@domain/community/community/CommunityContext';
import { SpaceContextProvider } from '@domain/journey/space/SpaceContext/SpaceContext';
import HomePage from '../topLevelPages/Home/HomePage';
import { Error404 } from '@core/pages/Errors/Error404';
import { Restricted } from '@core/routing/Restricted';
import { nameOfUrl } from './urlParams';
import { IdentityRoute } from '@core/auth/authentication/routing/IdentityRoute';
import { WithApmTransaction } from '@domain/shared/components';
import devRoute from '@dev/routes';
import NoIdentityRedirect from '@core/routing/NoIdentityRedirect';
import RedirectToLanding from '@domain/platform/routes/RedirectToLanding';
import NonIdentity from '@domain/platform/routes/NonIdentity';
import useRedirectToIdentityDomain from '@core/auth/authentication/routing/useRedirectToIdentityDomain';
import { EntityPageLayoutHolder, NotFoundPageLayout, RenderPoint } from '@domain/journey/common/EntityPageLayout';
import RedirectToWelcomeSite from '@domain/platform/routes/RedirectToWelcomeSite';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import Loading from '@core/ui/loading/Loading';

const DocumentationPage = React.lazy(() => import('@domain/documentation/DocumentationPage'));
const SpaceExplorerPage = React.lazy(() => import('../topLevelPages/topLevelSpaces/SpaceExplorerPage'));
const InnovationLibraryPage = React.lazy(() => import('../topLevelPages/InnovationLibraryPage/InnovationLibraryPage'));
const ContributorsPage = React.lazy(() => import('@domain/community/user/ContributorsPage'));
const AdminRoute = React.lazy(() => import('@domain/platform/admin/routing/AdminRoute'));
const UserRoute = React.lazy(() => import('@domain/community/user/routing/UserRoute'));
const OrganizationRoute = React.lazy(
  () => import('@domain/community/contributor/organization/routing/OrganizationRoute')
);
const VCRoute = React.lazy(() => import('@domain/community/virtualContributor/VCRoute'));
const ForumRoute = React.lazy(() => import('@domain/communication/discussion/routing/ForumRoute'));
const InnovationPackRoute = React.lazy(() => import('@domain/InnovationPack/InnovationPackRoute'));
const ProfileRoute = React.lazy(() => import('@domain/community/profile/routing/ProfileRoute'));
const CreateSpaceDialog = React.lazy(() => import('@domain/journey/space/createSpace/CreateSpaceDialog'));
const SpaceRoute = React.lazy(() => import('@domain/journey/space/routing/SpaceRoute'));

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
                  <CommunityContextProvider>
                    <EntityPageLayoutHolder>
                      <Suspense fallback={<Loading />}>
                        <SpaceRoute />
                      </Suspense>
                      <RenderPoint />
                    </EntityPageLayoutHolder>
                  </CommunityContextProvider>
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
          path={`/${TopLevelRoutePath.Profile}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Profile}`}>
                <Suspense fallback={<Loading />}>
                  <ProfileRoute />
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
