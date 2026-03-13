import { Suspense, useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Redirect from '@/core/routing/Redirect';
import Loading from '@/core/ui/loading/Loading';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';
import { nameOfUrl } from '@/main/routing/urlParams';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceContext, SpaceContextProvider } from '../context/SpaceContext';
import SubspaceContextProvider from '../context/SubspaceContext';
import { SpacePageLayout } from '../layout/SpacePageLayout';
import useSpaceTabs from '../layout/tabbedLayout/layout/useSpaceTabs';
import { useSectionIndex } from '../layout/useSectionIndex';

// Lazy load page components to reduce initial bundle size
const SpaceDashboardPage = lazyWithGlobalErrorHandler(
  () => import('../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage')
);
const SpaceAboutPage = lazyWithGlobalErrorHandler(() => import('@/domain/space/about/SpaceAboutPage'));
const SpaceAdminL0Route = lazyWithGlobalErrorHandler(() => import('../../spaceAdmin/routing/SpaceAdminRouteL0'));
const SpaceCommunityPage = lazyWithGlobalErrorHandler(
  () => import('../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage')
);
const SpaceSubspacesPage = lazyWithGlobalErrorHandler(() => import('../layout/tabbedLayout/Tabs/SpaceSubspacesPage'));
const SpaceCustomTabPage = lazyWithGlobalErrorHandler(
  () => import('../layout/tabbedLayout/Tabs/SpaceCustomTabPage/SpaceCustomTabPage')
);
const SubspaceRoutes = lazyWithGlobalErrorHandler(() => import('./SubspaceRoutes'));
const SpaceCalloutPage = lazyWithGlobalErrorHandler(() => import('../pages/SpaceCalloutPage'));

const LegacyRoutesRedirects = () => {
  const {
    space: { nameID: spaceNameId },
  } = useContext(SpaceContext);
  return (
    <Routes>
      <Route
        path={EntityPageSection.Dashboard}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace={true} />}
      />
      path={EntityPageSection.Community}
      <Route element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=2`} replace={true} />} />
      <Route
        path={EntityPageSection.Subspaces}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=3`} replace={true} />}
      />
      <Route
        path={EntityPageSection.KnowledgeBase}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=4`} replace={true} />}
      />
      <Route
        path={EntityPageSection.Custom}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=5`} replace={true} />}
      />
      <Route
        path={EntityPageSection.Contribute}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace={true} />}
      />
      <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
    </Routes>
  );
};

const SpaceProtectedRoutes = () => {
  const { loading: resolvingUrl } = useUrlResolver();
  const { permissions, loading: loadingSpace } = useContext(SpaceContext);

  if (resolvingUrl || loadingSpace) {
    return <Loading />;
  }

  if (!permissions.canRead) {
    return <Navigate to={`../${EntityPageSection.About}`} replace={true} />;
  }

  return <Outlet />;
};

export const SpaceTabbedPages = () => {
  const { spaceId, spaceLevel } = useUrlResolver();

  const sectionIndex = useSectionIndex({ spaceId, spaceLevel });
  const { tabs } = useSpaceTabs({ spaceId, skip: !spaceId });

  // Convert sectionIndex to number for comparison
  const currentSectionNumber = parseInt(sectionIndex, 10);
  const totalTabs = tabs.length;

  return (
    <Suspense fallback={<Loading />}>
      {sectionIndex === '0' && <SpaceDashboardPage />}
      {sectionIndex === '1' && <SpaceCommunityPage />}
      {sectionIndex === '2' && <SpaceSubspacesPage />}
      {currentSectionNumber >= 3 && currentSectionNumber < totalTabs && (
        <SpaceCustomTabPage sectionIndex={currentSectionNumber} />
      )}
    </Suspense>
  );
};

const SpaceRoutes = () => {
  return (
    <SpaceContextProvider>
      <Routes>
        {/* keep the logic around sections in one place - here*/}
        <Route path="/" element={<SpacePageLayout />}>
          <Route
            path={EntityPageSection.About}
            element={
              <Suspense fallback={<Loading />}>
                <SpaceAboutPage />
              </Suspense>
            }
          />

          <Route element={<SpaceProtectedRoutes />}>
            <Route index={true} element={<SpaceTabbedPages />} />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
              element={
                <Suspense fallback={<Loading />}>
                  <SpaceCalloutPage />
                </Suspense>
              }
            />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
              element={
                <Suspense fallback={<Loading />}>
                  <SpaceCalloutPage />
                </Suspense>
              }
            />
            <Route
              path={`${EntityPageSection.Settings}/*`}
              element={
                <Suspense fallback={<Loading />}>
                  <SpaceAdminL0Route />
                </Suspense>
              }
            />
            <Route
              path={`/:dialog?/:${nameOfUrl.calendarEventNameId}?`}
              element={
                <Suspense fallback={<Loading />}>
                  <SpaceDashboardPage />
                </Suspense>
              }
            />
          </Route>
          {/* subspaces have their own protections */}
          <Route
            path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
            element={
              <SubspaceContextProvider>
                <Suspense fallback={<Loading />}>
                  <SubspaceRoutes />
                </Suspense>
              </SubspaceContextProvider>
            }
          />

          <Route path="*" element={<LegacyRoutesRedirects />} />
        </Route>
      </Routes>
    </SpaceContextProvider>
  );
};

export default SpaceRoutes;
