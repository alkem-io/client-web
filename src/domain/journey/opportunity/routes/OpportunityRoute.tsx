import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../../../core/ui/loading/Loading';
import { useOpportunity } from '../hooks/useOpportunity';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OpportunityAgreementsPage from '../pages/OpportunityAgreementsPage';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import { EntityPageLayoutHolder, NotFoundPageLayout } from '../../common/EntityPageLayout';
import { routes } from './opportunityRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import OpportunityAboutPage from '../pages/OpportunityAboutPage';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import Redirect from '../../../../core/routing/Redirect';
import OpportunityCalloutPage from '../opportunityCalloutPage/OpportunityCalloutPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths: _paths }) => {
  const { displayName, opportunityNameId, spaceNameId, challengeNameId, loading } = useOpportunity();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  return (
    <StorageConfigContextProvider
      locationType="journey"
      journeyTypeName="opportunity"
      {...{ spaceNameId, challengeNameId, opportunityNameId }}
    >
      <Routes>
        <Route path={'/'} element={<EntityPageLayoutHolder />}>
          <Route index element={<Navigate replace to={routes.Dashboard} />} />
          <Route path={routes.Dashboard} element={<OpportunityDashboardPage />} />
          <Route path={`${routes.Dashboard}/updates`} element={<OpportunityDashboardPage dialog="updates" />} />
          <Route
            path={`${routes.Dashboard}/contributors`}
            element={<OpportunityDashboardPage dialog="contributors" />}
          />
          <Route path={routes.Contribute} element={<JourneyContributePage journeyTypeName="opportunity" />} />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<OpportunityCalloutPage />} />
          <Route path={`${routes.Dashboard}/calendar`} element={<OpportunityDashboardPage dialog="calendar" />} />
          <Route
            path={`${routes.Dashboard}/calendar/:${nameOfUrl.calendarEventNameId}`}
            element={<OpportunityDashboardPage dialog="calendar" />}
          />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<OpportunityCalloutPage>{props => <CalloutRoute {...props} />}</OpportunityCalloutPage>}
          />
          <Route path={routes.About} element={<OpportunityAboutPage />} />
          <Route path={routes.Agreements} element={<OpportunityAgreementsPage paths={currentPaths} />} />
          <Route
            path="*"
            element={
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            }
          />
        </Route>
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default OpportunityRoute;
