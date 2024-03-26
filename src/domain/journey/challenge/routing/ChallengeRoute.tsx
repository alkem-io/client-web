import React from 'react';
import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import Loading from '../../../../core/ui/loading/Loading';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import { OpportunityProvider } from '../../opportunity/context/OpportunityProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import OpportunityRoute from '../../opportunity/routes/OpportunityRoute';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';
import CommunityFeedbackRoute from './CommunityContextFeedback';
import { EntityPageLayoutHolder, NotFoundPageLayout } from '../../common/EntityPageLayout';
import { routes } from '../routes/challengeRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import ChallengeAboutPage from '../pages/ChallengeAboutPage';
import ChallengeOpportunitiesPage from '../pages/ChallengeOpportunitiesPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import Redirect from '../../../../core/routing/Redirect';
import ChallengeCalloutPage from '../challengeCalloutPage/ChallengeCalloutPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const ChallengeRoute = () => {
  const { journeyId, loading } = useRouteResolver();

  if (loading) {
    return <Loading text="Loading challenge" />;
  }

  return (
    <StorageConfigContextProvider locationType="journey" journeyTypeName="challenge" journeyId={journeyId}>
      <Routes>
        <Route path="/" element={<EntityPageLayoutHolder />}>
          <Route index element={<Navigate replace to={routes.Dashboard} />} />
          <Route path={routes.Dashboard} element={<ChallengeDashboardPage />} />
          <Route path={`${routes.Dashboard}/updates`} element={<ChallengeDashboardPage dialog="updates" />} />
          <Route path={`${routes.Dashboard}/contributors`} element={<ChallengeDashboardPage dialog="contributors" />} />
          <Route path={routes.Contribute} element={<JourneyContributePage journeyTypeName="challenge" />} />
          <Route path={routes.About} element={<ChallengeAboutPage />} />
          <Route path={routes.Opportunities} element={<ChallengeOpportunitiesPage />} />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<ChallengeCalloutPage />} />
          <Route path={`${routes.Dashboard}/calendar`} element={<ChallengeDashboardPage dialog="calendar" />} />
          <Route
            path={`${routes.Dashboard}/calendar/:${nameOfUrl.calendarEventNameId}`}
            element={<ChallengeDashboardPage dialog="calendar" />}
          />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<ChallengeCalloutPage />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<ChallengeCalloutPage>{props => <CalloutRoute {...props} />}</ChallengeCalloutPage>}
          />
          <Route
            path="*"
            element={
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            }
          />
        </Route>
        <Route path="feedback/*" element={<CommunityFeedbackRoute />} />
        <Route
          path={`${routes.Opportunities}/:${nameOfUrl.opportunityNameId}/*`}
          element={
            <OpportunityProvider>
              <CommunityContextProvider>
                <OpportunityRoute />
              </CommunityContextProvider>
            </OpportunityProvider>
          }
        />
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default ChallengeRoute;
