import React from 'react';
import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import { OpportunityProvider } from '../../opportunity/context/OpportunityProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import { NotFoundPageLayout } from '../../common/EntityPageLayout';
import { routes } from '../routes/challengeRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import ChallengeAboutPage from '../pages/SubspaceAboutPage';
import ChallengeOpportunitiesPage from '../pages/SubspaceOpportunitiesPage';
import SubspaceHomePage from '../subspaceHome/SubspaceHomePage';
import Redirect from '../../../../core/routing/Redirect';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import SubspaceCalloutPage from '../subspaceCalloutPage/SubspaceCalloutPage';
import { SubspaceDialog } from '../layout/SubspaceDialog';

const SubspaceRoute = () => {
  const { journeyId } = useRouteResolver();

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={journeyId}>
      <Routes>
        <Route index element={<SubspaceHomePage />} />
        <Route path={SubspaceDialog.Index} element={<SubspaceHomePage dialog={SubspaceDialog.Index} />} />
        <Route path={SubspaceDialog.Subspaces} element={<SubspaceHomePage dialog={SubspaceDialog.Subspaces} />} />
        <Route path={SubspaceDialog.Contributors} element={<SubspaceHomePage dialog={SubspaceDialog.Contributors} />} />
        <Route path={SubspaceDialog.Activity} element={<SubspaceHomePage dialog={SubspaceDialog.Activity} />} />
        <Route path={SubspaceDialog.Timeline} element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />} />
        <Route path={SubspaceDialog.Share} element={<SubspaceHomePage dialog={SubspaceDialog.Share} />} />
        <Route
          path={`${SubspaceDialog.Timeline}/:${nameOfUrl.calendarEventNameId}`}
          element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />}
        />
        {/* Redirecting legacy dashboard links to Subspace Home */}
        <Route path={routes.Dashboard} element={<Navigate replace to="/" />} />
        <Route path={routes.About} element={<ChallengeAboutPage />} />
        <Route path={routes.Subsubspaces} element={<ChallengeOpportunitiesPage />} />
        <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SubspaceCalloutPage />} />
        <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SubspaceCalloutPage />} />
        <Route
          path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
          element={<SubspaceCalloutPage>{props => <CalloutRoute {...props} />}</SubspaceCalloutPage>}
        />
        <Route
          path="*"
          element={
            <NotFoundPageLayout>
              <Error404 />
            </NotFoundPageLayout>
          }
        />
        <Route
          path={`opportunities/:${nameOfUrl.subsubspaceNameId}/*`}
          element={
            <OpportunityProvider>
              <CommunityContextProvider>
                <SubspaceRoute />
              </CommunityContextProvider>
            </OpportunityProvider>
          }
        />
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
