import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ChallengeProvider } from '../../subspace/context/SubspaceProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import SubspaceRoute from '../../subspace/routing/SubspaceRoute';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import { routes } from '../routes/spaceRoutes';
import { EntityPageLayoutHolder, NotFoundPageLayout } from '../../common/EntityPageLayout';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import Redirect from '../../../../core/routing/Redirect';
import SpaceCalloutPage from '../spaceCalloutPage/SpaceCalloutPage';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import KnowledgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export const SpaceRoute = () => {
  const { journeyId } = useRouteResolver();

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={journeyId}>
      <Routes>
        <Route path="/" element={<EntityPageLayoutHolder />}>
          <Route index element={<Navigate replace to={routes.Dashboard} />} />
          <Route path={routes.Dashboard} element={<SpaceDashboardPage />} />
          <Route path={`${routes.Dashboard}/updates`} element={<SpaceDashboardPage dialog="updates" />} />
          <Route path={`${routes.Dashboard}/contributors`} element={<SpaceDashboardPage dialog="contributors" />} />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
          />
          <Route path={`${routes.Dashboard}/calendar`} element={<SpaceDashboardPage dialog="calendar" />} />
          <Route
            path={`${routes.Dashboard}/calendar/:${nameOfUrl.calendarEventNameId}`}
            element={<SpaceDashboardPage dialog="calendar" />}
          />
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
        </Route>
        <Route
          path={`challenges/:${nameOfUrl.subspaceNameId}/*`}
          element={
            <ChallengeProvider>
              <CommunityContextProvider>
                <SubspaceRoute />
              </CommunityContextProvider>
            </ChallengeProvider>
          }
        />
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
