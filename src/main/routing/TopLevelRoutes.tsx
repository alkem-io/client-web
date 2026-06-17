import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IdentityRoute } from '@/core/auth/authentication/routing/IdentityRoute';
import useRedirectToIdentityDomain from '@/core/auth/authentication/routing/useRedirectToIdentityDomain';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import Loading from '@/core/ui/loading/Loading';
import devRoute from '@/dev/routes';
import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import NonIdentity from '@/domain/platform/routes/NonIdentity';
import RedirectToLanding from '@/domain/platform/routes/RedirectToLanding';
import RedirectToWelcomeSite from '@/domain/platform/routes/RedirectToWelcomeSite';
import { WithApmTransaction } from '@/domain/shared/components/WithApmTransaction/WithApmTransaction';
import { CrdNotFoundBranch } from '@/main/crdPages/error/CrdNotFoundBranch';
import { CrdRestrictedRoute } from '@/main/crdPages/error/CrdRestrictedRoute';
import { CrdLayoutWrapper } from '../ui/layout/CrdLayoutWrapper';
import App from '../ui/layout/topLevelWrappers/App';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import { nameOfUrl } from './urlParams';
import { UrlResolverProvider } from './urlResolver/UrlResolverProvider';

const CrdPublicWhiteboardPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/whiteboard/CrdPublicWhiteboardPage')
);
const RedirectDocumentation = lazyWithGlobalErrorHandler(() => import('@/main/documentation/RedirectDocumentation'));
const CrdSpaceExplorerPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/spaces/SpaceExplorerPage'));
const CrdHomePage = lazyWithGlobalErrorHandler(() => import('@/main/topLevelPages/Home/CrdHomePage'));
const CrdInnovationLibraryPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationLibrary/CrdInnovationLibraryPage')
);
const CrdAdminRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/admin/CrdAdminRoutes'));
const CrdForumRoute = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/forum/CrdForumRoute'));
const CrdDocumentationPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/documentation/CrdDocumentationPage')
);
const CrdHubRoute = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/innovationHub/routing/CrdHubRoute'));
const CrdSpaceRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/space/routing/CrdSpaceRoutes'));
const CrdUserRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/userPages/CrdUserRoutes'));
const CrdOrganizationRoutes = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes')
);
const CrdVCRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/vcPages/CrdVCRoutes'));
const InnovationPackRoute = lazyWithGlobalErrorHandler(() => import('@/domain/InnovationPack/InnovationPackRoute'));

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
        <Route index={true} element={<RedirectToLanding />} />
        <Route path={TopLevelRoutePath._Landing} element={<RedirectToWelcomeSite />} />
        {/* Public routes - accessible without authentication */}
        <Route
          path={`${GUEST_SHARE_PATH}/:whiteboardId`}
          element={
            <WithApmTransaction path={`${GUEST_SHARE_PATH}/:whiteboardId`}>
              <Suspense fallback={<Loading />}>
                <CrdPublicWhiteboardPage />
              </Suspense>
            </WithApmTransaction>
          }
        />
        {IdentityRoute()}
        {devRoute()}
        {/* Dashboard page. The CrdHomePage dispatcher shows the innovation-hub home page on a
            hub subdomain, else the CRD dashboard; the CrdLayoutWrapper decision lives inside
            the dispatcher because the hub page carries its own layout. */}
        <Route
          path={TopLevelRoutePath.Home}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.Home}>
                <Suspense fallback={<Loading />}>
                  <CrdHomePage />
                </Suspense>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        {/* Documentation page */}
        <Route
          element={
            <NonIdentity>
              <CrdLayoutWrapper />
            </NonIdentity>
          }
        >
          <Route
            path={`${TopLevelRoutePath.Docs}/*`}
            element={
              <WithApmTransaction path={`/${TopLevelRoutePath.Docs}`}>
                <Suspense fallback={<Loading />}>
                  <CrdDocumentationPage />
                </Suspense>
              </WithApmTransaction>
            }
          />
        </Route>
        <Route
          path={`${TopLevelRoutePath.Documentation}/*`}
          element={
            <Suspense fallback={<Loading />}>
              <RedirectDocumentation />
            </Suspense>
          }
        />
        {/* Spaces page */}
        <Route
          element={
            <NonIdentity>
              <CrdLayoutWrapper />
            </NonIdentity>
          }
        >
          <Route
            path={`/${TopLevelRoutePath.Spaces}`}
            element={
              <WithApmTransaction path={`/${TopLevelRoutePath.Spaces}`}>
                <Suspense fallback={<Loading />}>
                  <CrdSpaceExplorerPage />
                </Suspense>
              </WithApmTransaction>
            }
          />
        </Route>

        <Route
          path={`/${TopLevelRoutePath.Restricted}`}
          element={
            <WithApmTransaction path={`/${TopLevelRoutePath.Restricted}`}>
              <CrdRestrictedRoute />
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
                          <CrdLayoutWrapper>
                            <CrdAdminRoutes />
                          </CrdLayoutWrapper>
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
                            <CrdUserRoutes />
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
                            <CrdVCRoutes />
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
                          <CrdOrganizationRoutes />
                        </Suspense>
                      </WithApmTransaction>
                    }
                  />
                  <Route element={<CrdLayoutWrapper />}>
                    <Route
                      path={`/${TopLevelRoutePath.InnovationLibrary}`}
                      element={
                        <WithApmTransaction path={`/${TopLevelRoutePath.InnovationLibrary}`}>
                          <Suspense fallback={<Loading />}>
                            <CrdInnovationLibraryPage />
                          </Suspense>
                        </WithApmTransaction>
                      }
                    />
                  </Route>
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
                  {/* Innovation Hub /hub/<slug>/* */}
                  <Route element={<CrdLayoutWrapper />}>
                    <Route
                      path={`${TopLevelRoutePath.Hub}/*`}
                      element={
                        <WithApmTransaction path={TopLevelRoutePath.Hub}>
                          <Suspense fallback={<Loading />}>
                            <CrdHubRoute />
                          </Suspense>
                        </WithApmTransaction>
                      }
                    />
                  </Route>
                  {/* Forum page */}
                  <Route element={<CrdLayoutWrapper />}>
                    <Route
                      path={`/${TopLevelRoutePath.Forum}/*`}
                      element={
                        <WithApmTransaction path={`/${TopLevelRoutePath.Forum}`}>
                          <Suspense fallback={<Loading />}>
                            <CrdForumRoute />
                          </Suspense>
                        </WithApmTransaction>
                      }
                    />
                  </Route>
                  {/* Space page */}
                  <Route element={<CrdLayoutWrapper />}>
                    <Route
                      path={`:${nameOfUrl.spaceNameId}/*`}
                      element={
                        <WithApmTransaction path={`:${nameOfUrl.spaceNameId}/*`}>
                          <Suspense fallback={<Loading />}>
                            <CrdSpaceRoutes />
                          </Suspense>
                        </WithApmTransaction>
                      }
                    />
                  </Route>
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
                        <CrdNotFoundBranch />
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
