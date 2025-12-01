import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../ui/layout/topLevelWrappers/App';
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
import RedirectToWelcomeSite from '@/domain/platform/routes/RedirectToWelcomeSite';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import Loading from '@/core/ui/loading/Loading';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { UrlResolverProvider } from './urlResolver/UrlResolverProvider';
import TopLevelLayout from '../ui/layout/TopLevelLayout';
import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';

const PublicWhiteboardPage = lazyWithGlobalErrorHandler(() => import('@/main/public/whiteboard/PublicWhiteboardPage'));
const DocumentationPage = lazyWithGlobalErrorHandler(() => import('@/main/documentation/DocumentationPage'));
const RedirectDocumentation = lazyWithGlobalErrorHandler(() => import('@/main/documentation/RedirectDocumentation'));
const SpaceExplorerPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/topLevelSpaces/SpaceExplorerPage')
);
const InnovationLibraryPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryPage')
);
const ContributorsPage = lazyWithGlobalErrorHandler(() => import('@/domain/community/user/ContributorsPage'));
const PlatformAdminRoute = lazyWithGlobalErrorHandler(
  () => import('@/domain/platformAdmin/routing/PlatformAdminRoute')
);
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
const SpaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SpaceRoutes'));

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
        {/* Public routes - accessible without authentication */}
        <Route
          path={`${GUEST_SHARE_PATH}/:whiteboardId`}
          element={
            <WithApmTransaction path={`${GUEST_SHARE_PATH}/:whiteboardId`}>
              <Suspense fallback={<Loading />}>
                <PublicWhiteboardPage />
              </Suspense>
            </WithApmTransaction>
          }
        />
        {IdentityRoute()}
        {devRoute()}
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
          path={`${TopLevelRoutePath.Docs}/*`}
          element={
            <Suspense fallback={<Loading />}>
              <DocumentationPage />
            </Suspense>
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
          path={`/${TopLevelRoutePath.Restricted}`}
          element={
            <WithApmTransaction path={`/${TopLevelRoutePath.Restricted}`}>
              <Restricted />
            </WithApmTransaction>
          }
        />

        {/* Routes that require Server Url Resolution (should go last) */}
        <Route
          path="*"
          element={
            <NonIdentity>
              <UrlResolverProvider>
                <Routes>
                  <Route
                    path={`/${TopLevelRoutePath.Admin}/*`}
                    element={
                      <WithApmTransaction path="/admin/*">
                        <Suspense fallback={<Loading />}>
                          <PlatformAdminRoute />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`/${TopLevelRoutePath.User}/*`}
                    element={
                      <WithApmTransaction path={`:${nameOfUrl.userNameId}/*`}>
                        <NoIdentityRedirect>
                          <Suspense fallback={<Loading />}>
                            <UserRoute />
                          </Suspense>
                        </NoIdentityRedirect>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`/${TopLevelRoutePath.VirtualContributor}/*`}
                    element={
                      <WithApmTransaction path={`:${nameOfUrl.vcNameId}/*`}>
                        <NonIdentity>
                          <Suspense fallback={<Loading />}>
                            <VCRoute />
                          </Suspense>
                        </NonIdentity>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`/${TopLevelRoutePath.Organization}/*`}
                    element={
                      <WithApmTransaction path={`:${nameOfUrl.organizationNameId}/*`}>
                        <Suspense fallback={<Loading />}>
                          <OrganizationRoute />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`/${TopLevelRoutePath.InnovationLibrary}`}
                    element={
                      <WithApmTransaction path={`/${TopLevelRoutePath.InnovationLibrary}`}>
                        <Suspense fallback={<Loading />}>
                          <InnovationLibraryPage />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`${TopLevelRoutePath.InnovationPacks}/*`}
                    element={
                      <WithApmTransaction path={TopLevelRoutePath.InnovationPacks}>
                        <Suspense fallback={<Loading />}>
                          <InnovationPackRoute />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`${TopLevelRoutePath.InnovationHubs}/*`}
                    element={
                      <WithApmTransaction path={TopLevelRoutePath.InnovationHubs}>
                        <Suspense fallback={<Loading />}>
                          <InnovationHubsRoutes />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`/${TopLevelRoutePath.Forum}/*`}
                    element={
                      <WithApmTransaction path={`/${TopLevelRoutePath.Forum}`}>
                        <Suspense fallback={<Loading />}>
                          <ForumRoute />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route
                    path={`:${nameOfUrl.spaceNameId}/*`}
                    element={
                      <WithApmTransaction path={`:${nameOfUrl.spaceNameId}/*`}>
                        <Suspense fallback={<Loading />}>
                          <SpaceRoutes />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  {/* Redirects */}
                  <Route path={`/${TopLevelRoutePath.Help}`} element={<Navigate to={`/${TopLevelRoutePath.Docs}`} />} />
                  <Route
                    path={`/${TopLevelRoutePath.About}`}
                    element={<Navigate to={`/${TopLevelRoutePath.Docs}`} />}
                  />

                  <Route
                    path="*"
                    element={
                      <WithApmTransaction path="*">
                        <TopLevelLayout>
                          <Error404 />
                        </TopLevelLayout>
                      </WithApmTransaction>
                    }
                  />
                </Routes>
              </UrlResolverProvider>
            </NonIdentity>
          }
        />
      </Route>
    </Routes>
  );
};
