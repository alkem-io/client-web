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
import useSpaceTabs from '../layout/tabbedLayout/layout/useSpaceTabs';
import { parseInt } from 'lodash';

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
  const { permissions, loading: loadingSpace } = useContext(SpaceContext);
  if (resolvingUrl || loadingSpace) {
    return null;
  }

  if (!permissions.canRead) {
    return <Navigate to={`../${EntityPageSection.About}`} replace />;
  }

  return <Outlet />;
};

const SpaceRoutes = () => {
  const { spaceId } = useUrlResolver();
  const [searchParams] = useSearchParams();
  const { defaultTabIndex } = useSpaceTabs({ spaceId: spaceId });
  let sectionIndex = searchParams.get(TabbedLayoutParams.Section);
  if (!sectionIndex) {
    if (defaultTabIndex && defaultTabIndex >= 0) {
      sectionIndex = defaultTabIndex.toString();
    } else {
      sectionIndex = '1';
    }
  } else {
    sectionIndex = `${parseInt(sectionIndex) - 1}`;
  }

  // not ideal but at least all routing is in one place ^^
  const getSpaceSection = () => {
    switch (sectionIndex) {
      case '0':
        return <SpaceDashboardPage />;
      case '1':
        return <SpaceCommunityPage />;
      case '2':
        return <SpaceSubspacesPage />;
      case '3':
        return <SpaceKnowledgeBasePage sectionIndex={3} />;
    }
  };
  return (
    <SpaceContextProvider>
      <Routes>
        {/* keep the logic around sections in one place - here*/}
        <Route path="/" element={<SpacePageLayout sectionIndex={parseInt(`${sectionIndex}`)} />}>
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
          <Route path="*" element={<LegacyRoutesRedirects />} />
        </Route>
      </Routes>
    </SpaceContextProvider>
  );
};

export default SpaceRoutes;
