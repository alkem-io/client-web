import { Route, Routes, Navigate, useSearchParams } from 'react-router-dom';
import SubspaceProvider from '@/domain/space/context/SubspaceProvider';
import { nameOfUrl } from '@/main/routing/urlParams';
import { Error404 } from '@/core/pages/Errors/Error404';
import { NotFoundPageLayout } from '@/domain/space/layout/EntityPageLayout';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import Redirect from '@/core/routing/Redirect';
import SpaceCalloutPage from '../pages/SpaceCalloutPage';
import SpaceSettingsRoute from '@/domain/space/routing/toReview2/SpaceSettingsRoute';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import React, { PropsWithChildren, ReactNode, Suspense } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import { useSpace } from '@/domain/space/context/useSpace';
import SpaceAboutPage from '@/domain/space/about/SpaceAboutPage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import TabbedLayoutPage, { TabbedLayoutParams } from '../layout/tabbedLayout/TabbedLayoutPage';
import Loading from '@/core/ui/loading/Loading';
import { Box } from '@mui/material';

const SubspaceRoute = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoute'));
const routes = { ...EntityPageSection };

interface RestrictedRouteProps extends PropsWithChildren {
  loading: boolean;
  allowed: boolean;
  baseUrl: string;
  alwaysAllowedUrl: string;
  notAllowedComponent: ReactNode;
}

const RestrictedRoute = ({
  loading,
  allowed,
  baseUrl,
  alwaysAllowedUrl,
  notAllowedComponent,
  children,
}: RestrictedRouteProps) => {
  if (loading) {
    return undefined;
  }
  const baseUrlPath = new URL(baseUrl).pathname;
  if (!allowed) {
    return (
      <>
        <Route path={alwaysAllowedUrl} element={notAllowedComponent} />
        <Route path="*" element={<Navigate to={`${baseUrlPath}/${alwaysAllowedUrl}`} replace />} />
      </>
    );
  }

  return <>{children}</>;
};

const SpaceTabbedLayoutRoute = () => {
  const { loading: resolvingUrl } = useUrlResolver();

  const { space, permissions, loading: loadingSpace } = useSpace();

  const [params] = useSearchParams();
  const section = params.get(TabbedLayoutParams.Section) ?? undefined; // avoid nulls here for typescript
  const dialog = params.get(TabbedLayoutParams.Dialog) ?? undefined;

  const loading = resolvingUrl || loadingSpace;
  console.log({ resolvingUrl, loadingSpace });
  /*
  const navigate = useNavigate();
  const { spaceNameId } = useParams<{ spaceNameId: string }>(); //!!
  const lastVisitedTabRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!permissions.canRead || !spaceNameId || reservedTopLevelRoutePaths.includes(spaceNameId)) {
      return;
    }

    const defaultState = spaceTabsData?.lookup.space?.collaboration.innovationFlow.currentState.displayName;
    const defaultStateIndex = spaceTabsData?.lookup.space?.collaboration.innovationFlow.states.findIndex(
      state => state.displayName === defaultState
    );

    const newDefaultTab = (() => {
      switch (defaultStateIndex) {
        case 1:
          return routes.Community;
        case 2:
          return routes.Subspaces;
        case 3:
          return routes.KnowledgeBase;
        case 4:
          return routes.Custom;
        case 0:
        default:
          return routes.Dashboard;
      }
    })();

    const currentPath = location.pathname;

    // Check explicitly if we are on any of the valid top-level tabs
    const isAtTabLevel = Object.values(routes).some(
      tabRoute => currentPath === `/${spaceNameId}/${tabRoute}` || currentPath === `/${spaceNameId}/${tabRoute}/`
    );

    const lastTabForSpace = lastVisitedTabRef.current[spaceNameId];

    // Navigate explicitly if:
    // 1. Exactly at space root OR
    // 2. On a valid top-level tab AND the default tab has changed
    const isExactSpaceRoot = currentPath === `/${spaceNameId}` || currentPath === `/${spaceNameId}/`;

    if (isExactSpaceRoot || (isAtTabLevel && lastTabForSpace !== newDefaultTab)) {
      navigate(`/${spaceNameId}/${newDefaultTab}`, { replace: true });
    }

    // always update cached tab after navigation logic
    lastVisitedTabRef.current[spaceNameId] = newDefaultTab;
  }, [spaceTabsData, loadingSpace, location.pathname, spaceNameId, navigate, permissions.canRead]);
*/

  return (
    <Suspense
      fallback={
        <Box sx={{ background: 'red', height: '200px' }}>
          <Loading text="Loading space....!!" />
        </Box>
      }
    >
      <Routes>
        {RestrictedRoute({
          loading: loading,
          allowed: permissions.canRead,
          notAllowedComponent: <SpaceAboutPage />,
          baseUrl: space.about.profile.url,
          alwaysAllowedUrl: routes.About,
          children: (
            <>
              <Route index element={<TabbedLayoutPage section={section} dialog={dialog} />} />
              <Route path={routes.About} element={<TabbedLayoutPage section={undefined} dialog="about" />} />
              <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} />
              <Route
                path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
                element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
              />
              <Route path="calendar" element={<TabbedLayoutPage section={'1'} dialog="calendar" />} />
              <Route
                path={`calendar/:${nameOfUrl.calendarEventNameId}`}
                element={<SpaceDashboardPage dialog="calendar" />}
              />
              <Route path={`${routes.Settings}/*`} element={<SpaceSettingsRoute />} />
              <Route
                path={`challenges/:${nameOfUrl.subspaceNameId}/*`}
                element={
                  <SubspaceProvider>
                    <Suspense fallback={null}>
                      <SubspaceRoute />
                    </Suspense>
                  </SubspaceProvider>
                }
              />
              <Route path="explore/*" element={<Redirect to={routes.Contribute} />} /> {/* //!!?? */}
              <Route
                path="*"
                element={
                  <NotFoundPageLayout>
                    <Error404 />
                  </NotFoundPageLayout>
                }
              />
            </>
          ),
        })}
      </Routes>
    </Suspense>
  );
};

export default SpaceTabbedLayoutRoute;
