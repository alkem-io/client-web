import { useContext } from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { nameOfUrl } from '@/main/routing/urlParams';
import Redirect from '@/core/routing/Redirect';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import SpaceAboutPage from '@/domain/space/about/SpaceAboutPage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpaceAdminL0Route from '../../spaceAdmin/routing/SpaceAdminRouteL0';
import SubspaceContextProvider from '../context/SubspaceContext';
import { SpaceContext, SpaceContextProvider } from '../context/SpaceContext';
import { SpacePageLayout } from '../layout/SpacePageLayout';
import SpaceCommunityPage from '../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from '../layout/tabbedLayout/Tabs/SpaceSubspacesPage';
import FlowStateTabPage from '../layout/tabbedLayout/Tabs/FlowStateTabPage/FlowStateTabPage';
import SubspaceRoutes from './SubspaceRoutes';
import SpaceCalloutPage from '../pages/SpaceCalloutPage';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import Loading from '@/core/ui/loading/Loading';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';
import { useSectionIndex } from '../layout/useSectionIndex';
import useSpaceTabs from '../layout/tabbedLayout/layout/useSpaceTabs';

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
    return <Loading />;
  }

  if (!permissions.canRead) {
    return <Navigate to={`../${EntityPageSection.About}`} replace />;
  }

  return <Outlet />;
};

export const SpaceTabbedPages = () => {
  const { spaceId, spaceLevel } = useUrlResolver();

  const sectionIndex = useSectionIndex({ spaceId, spaceLevel });
  const { tabs } = useSpaceTabs({ spaceId, skip: !spaceId });

  // Convert sectionIndex to number for comparison
  const currentSectionNumber = parseInt(sectionIndex);
  const totalTabs = tabs.length;

  return (
    <>
      {sectionIndex === '0' && <SpaceDashboardPage />}
      {sectionIndex === '1' && <SpaceCommunityPage />}
      {sectionIndex === '2' && <SpaceSubspacesPage />}
      {currentSectionNumber >= 3 && currentSectionNumber < totalTabs && (
        <FlowStateTabPage sectionIndex={currentSectionNumber} />
      )}
    </>
  );
};

const SpaceRoutes = () => {
  return (
    <SpaceContextProvider>
      <Routes>
        {/* keep the logic around sections in one place - here*/}
        <Route path="/" element={<SpacePageLayout />}>
          <Route path={EntityPageSection.About} element={<SpaceAboutPage />} />

          <Route element={<SpaceProtectedRoutes />}>
            <Route index element={<SpaceTabbedPages />} />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
              element={<SpaceCalloutPage />}
            />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
              element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
            />
            <Route path={`${EntityPageSection.Settings}/*`} element={<SpaceAdminL0Route />} />
            <Route path={`/:dialog?/:${nameOfUrl.calendarEventNameId}?`} element={<SpaceDashboardPage />} />
          </Route>
          {/* subspaces have their own protections */}
          <Route
            path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
            element={
              <SubspaceContextProvider>
                <SubspaceRoutes />
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
