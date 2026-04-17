import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IdentityRoute } from '@/core/auth/authentication/routing/IdentityRoute';
import useRedirectToIdentityDomain from '@/core/auth/authentication/routing/useRedirectToIdentityDomain';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import { Restricted } from '@/core/routing/Restricted';
import Loading from '@/core/ui/loading/Loading';
import devRoute from '@/dev/routes';
import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import NonIdentity from '@/domain/platform/routes/NonIdentity';
import RedirectToLanding from '@/domain/platform/routes/RedirectToLanding';
import RedirectToWelcomeSite from '@/domain/platform/routes/RedirectToWelcomeSite';
import { WithApmTransaction } from '@/domain/shared/components/WithApmTransaction/WithApmTransaction';
import { useCrdEnabled } from '../crdPages/useCrdEnabled';
import { CrdLayoutWrapper } from '../ui/layout/CrdLayoutWrapper';
import TopLevelLayout from '../ui/layout/TopLevelLayout';
import App from '../ui/layout/topLevelWrappers/App';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import { nameOfUrl } from './urlParams';
import { UrlResolverProvider } from './urlResolver/UrlResolverProvider';

const HomePage = lazyWithGlobalErrorHandler(() => import('@/main/topLevelPages/Home/HomePage'));
const PublicWhiteboardPage = lazyWithGlobalErrorHandler(() => import('@/main/public/whiteboard/PublicWhiteboardPage'));
const CrdPublicWhiteboardPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/whiteboard/CrdPublicWhiteboardPage')
);
const DocumentationPage = lazyWithGlobalErrorHandler(() => import('@/main/documentation/DocumentationPage'));
const RedirectDocumentation = lazyWithGlobalErrorHandler(() => import('@/main/documentation/RedirectDocumentation'));
const CrdSpaceExplorerPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/spaces/SpaceExplorerPage'));
const CrdDashboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/dashboard/DashboardPage'));
const MuiSpaceExplorerPage = lazyWithGlobalErrorHandler(
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
const HubRoute = lazyWithGlobalErrorHandler(() => import('@/domain/innovationHub/routing/HubRoute'));
const SpaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SpaceRoutes'));
const CrdSpaceRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/space/routing/CrdSpaceRoutes'));

export const TopLevelRoutes = () => {
  useRedirectToIdentityDomain();
  const crdEnabled = useCrdEnabled();

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
                {crdEnabled ? <CrdPublicWhiteboardPage /> : <PublicWhiteboardPage />}
              </Suspense>
            </WithApmTransaction>
          }
        />
        {IdentityRoute()}
        {devRoute()}
        {/* Dashboard page — toggleable between CRD (new) and MUI (old) via localStorage */}
        {crdEnabled ? (
          <Route
            element={
              <NonIdentity>
                <CrdLayoutWrapper />
              </NonIdentity>
            }
          >
            <Route
              path={TopLevelRoutePath.Home}
              element={
                <WithApmTransaction path={TopLevelRoutePath.Home}>
                  <Suspense fallback={<Loading />}>
                    <CrdDashboardPage />
                  </Suspense>
                </WithApmTransaction>
              }
            />
          </Route>
        ) : (
          <Route
            path={TopLevelRoutePath.Home}
            element={
              <NonIdentity>
                <WithApmTransaction path={TopLevelRoutePath.Home}>
                  <Suspense fallback={<Loading />}>
                    <HomePage />
                  </Suspense>
                </WithApmTransaction>
              </NonIdentity>
            }
          />
        )}
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
        {/* Spaces page — toggleable between CRD (new) and MUI (old) via localStorage */}
        {crdEnabled ? (
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
        ) : (
          <Route
            path={`/${TopLevelRoutePath.Spaces}`}
            element={
              <NonIdentity>
                <WithApmTransaction path={`/${TopLevelRoutePath.Spaces}`}>
                  <Suspense fallback={<Loading />}>
                    <MuiSpaceExplorerPage />
                  </Suspense>
                </WithApmTransaction>
              </NonIdentity>
            }
          />
        )}
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
                    path={`${TopLevelRoutePath.Hub}/*`}
                    element={
                      <WithApmTransaction path={TopLevelRoutePath.Hub}>
                        <Suspense fallback={<Loading />}>
                          <HubRoute />
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
                  {/* Space page — toggleable between CRD (new) and MUI (old) via localStorage */}
                  {crdEnabled ? (
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
                  ) : (
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
                  )}
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
