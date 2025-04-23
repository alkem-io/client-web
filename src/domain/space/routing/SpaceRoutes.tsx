import { Suspense, useContext } from 'react';
import { Route, Routes, Navigate, useSearchParams, Outlet } from 'react-router-dom';
import { nameOfUrl } from '@/main/routing/urlParams';
import Redirect from '@/core/routing/Redirect';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import SpaceAboutPage from '@/domain/space/about/SpaceAboutPage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { TabbedLayoutParams } from '../layout/tabbedLayout/TabbedLayoutPage';
import SpaceAdminL0Route from '../../spaceAdmin/routing/SpaceAdminRouteL0';
import SubspaceContextProvider from '../context/SubspaceContext';
import { SpaceContext, SpaceContextProvider } from '../context/SpaceContext';
import { SpacePageLayout } from '../layout/SpacePageLayout';
import SpaceCommunityPage from '../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from '../layout/tabbedLayout/Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '../layout/tabbedLayout/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import SubspaceRoutes from './SubspaceRoutes';
const LegacyRoutesRedirects = () => {
  const {
    space: { nameID: spaceNameId },
  } = useContext(SpaceContext);
  return (
    <Routes>
      <Route
        path={EntityPageSection.Dashboard}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace />}
      />
      path={EntityPageSection.Community}
      <Route element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=2`} replace />} />
      <Route
        path={EntityPageSection.Subspaces}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=3`} replace />}
      />
      <Route
        path={EntityPageSection.KnowledgeBase}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=4`} replace />}
      />
      <Route
        path={EntityPageSection.Custom}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=5`} replace />}
      />
      <Route
        path={EntityPageSection.Contribute}
        element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace />}
      />
      <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
    </Routes>
  );
};

const SpaceProtectedRoutes = () => {
  const { loading: resolvingUrl } = useUrlResolver();
  const { space, permissions, loading: loadingSpace } = useContext(SpaceContext);
  if (resolvingUrl || loadingSpace) {
    return null;
  }

  if (!permissions.canRead) {
    return <Navigate to={`${space.about.profile.url}/${EntityPageSection.About}`} replace />;
  }

  return <Outlet />;
};

const SpaceRoutes = () => {
  const [searchParams] = useSearchParams();
  const sectionIndex = searchParams.get(TabbedLayoutParams.Section) ?? '1';
  // not ideal but at least all routing is in one place ^^
  const getSpaceSection = () => {
    switch (sectionIndex) {
      case '1':
        return <SpaceDashboardPage />;
      case '2':
        return <SpaceCommunityPage />;
      case '3':
        return <SpaceSubspacesPage />;
      case '4':
        return <SpaceKnowledgeBasePage sectionIndex={3} />;
    }
  };
  return (
    <SpaceContextProvider>
      <Routes>
        {/* keep the logic around sections in one place - here*/}
        <Route path="/" element={<SpacePageLayout sectionIndex={parseInt(sectionIndex) - 1} />}>
          <Route path={EntityPageSection.About} element={<SpaceAboutPage />} />
          <Route element={<SpaceProtectedRoutes />}>
            <Route index element={getSpaceSection()} />
            <Route path="/:dialog?" element={<SpaceDashboardPage />} />

            <Route path={`${EntityPageSection.Settings}/*`} element={<SpaceAdminL0Route />} />
            <Route
              path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
              element={
                <SubspaceContextProvider>
                  <Suspense fallback={null}>
                    <SubspaceRoutes />
                  </Suspense>
                </SubspaceContextProvider>
              }
            />
            <Route
              path={`calendar/:${nameOfUrl.calendarEventNameId}?`}
              element={<SpaceDashboardPage dialog="calendar" />}
            />
          </Route>
        </Route>
        <Route path="*" element={<LegacyRoutesRedirects />} />
      </Routes>
    </SpaceContextProvider>
  );
};

export default SpaceRoutes;
