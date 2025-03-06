import { Navigate, Route, Routes } from 'react-router-dom';
import SubspaceProvider from '@/domain/journey/subspace/context/SubspaceProvider';
import { nameOfUrl } from '@/main/routing/urlParams';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceSubspacesPage from '../layout/TabbedSpaceL0/Tabs/SpaceSubspaces/SpaceSubspacesPage';
import { NotFoundPageLayout } from '@/domain/journey/common/EntityPageLayout';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import Redirect from '@/core/routing/Redirect';
import SpaceCalloutPage from '../../journey/space/spaceCalloutPage/SpaceCalloutPage';
import SpaceCommunityPage from '../layout/TabbedSpaceL0/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceKnowledgeBasePage from '@/domain/space/layout/TabbedSpaceL0/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import SpaceSettingsRoute from '@/domain/journey/settings/routes/SpaceSettingsRoute';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import React, { Suspense } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardPage';

const SubspaceRoute = lazyWithGlobalErrorHandler(() => import('@/domain/journey/subspace/routing/SubspaceRoute'));
const routes = { ...EntityPageSection };

const SpaceRoute = () => {
  return (
    <Routes>
      <Route index element={<Navigate replace to={routes.Dashboard} />} />
      <Route path={routes.Dashboard} element={<SpaceDashboardPage />} />
      <Route path={`${routes.Dashboard}/updates`} element={<SpaceDashboardPage dialog="updates" />} />
      <Route path={`${routes.Dashboard}/contributors`} element={<SpaceDashboardPage dialog="contributors" />} />
      <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} />
      <Route
        path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
        element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
      />
      <Route path="calendar" element={<SpaceDashboardPage dialog="calendar" />} />
      <Route path={`calendar/:${nameOfUrl.calendarEventNameId}`} element={<SpaceDashboardPage dialog="calendar" />} />
      <Route path={routes.Community} element={<SpaceCommunityPage />} />
      <Route path={routes.About} element={<SpaceDashboardPage dialog="about" />} />
      <Route path={routes.Subspaces} element={<SpaceSubspacesPage />} />
      <Route
        path={routes.KnowledgeBase}
        element={<SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />}
      />
      <Route path={routes.Custom} element={<SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.Custom} />} />
      <Route path={`${routes.Settings}/*`} element={<SpaceSettingsRoute />} />
      <Route
        path="*"
        element={
          <NotFoundPageLayout>
            <Error404 />
          </NotFoundPageLayout>
        }
      />
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
      <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
    </Routes>
  );
};

export default SpaceRoute;
