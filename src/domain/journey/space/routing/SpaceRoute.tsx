import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SubspaceProvider from '../../subspace/context/SubspaceProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import SubspaceRoute from '../../subspace/routing/SubspaceRoute';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import { routes } from '../routes/spaceRoutes';
import { NotFoundPageLayout } from '../../common/EntityPageLayout';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import Redirect from '../../../../core/routing/Redirect';
import SpaceCalloutPage from '../spaceCalloutPage/SpaceCalloutPage';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import KnowledgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';

export const SpaceRoute = () => {
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
      <Route path={routes.Subspaces} element={<SpaceChallengesPage />} />
      <Route path={routes.KnowledgeBase} element={<KnowledgeBasePage journeyTypeName="space" />} />
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
            <CommunityContextProvider>
              <SubspaceRoute />
            </CommunityContextProvider>
          </SubspaceProvider>
        }
      />
      <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
    </Routes>
  );
};
