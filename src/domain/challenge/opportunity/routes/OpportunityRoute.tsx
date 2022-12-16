import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../../../common/components/core/Loading/Loading';
import { useOpportunity } from '../hooks/useOpportunity';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OpportunityAgreementsPage from '../pages/OpportunityAgreementsPage';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import { EntityPageLayoutHolder } from '../../../shared/layout/PageLayout';
import { routes } from './opportunityRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import OpportunityAboutPage from '../pages/OpportunityAboutPage';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import CalloutsPage from '../../../collaboration/callout/CalloutsPage';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths: _paths }) => {
  const { displayName, opportunityNameId, loading } = useOpportunity();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunityNameId) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate replace to={routes.Dashboard} />} />
        <Route path={routes.Dashboard} element={<OpportunityDashboardPage />} />
        <Route path={`${routes.Dashboard}/updates`} element={<OpportunityDashboardPage dialog="updates" />} />
        <Route path={`${routes.Dashboard}/contributors`} element={<OpportunityDashboardPage dialog="contributors" />} />
        <Route
          path={routes.Explore}
          element={<CalloutsPage entityTypeName="opportunity" rootUrl={`${resolved.pathname}/${routes.Explore}`} />}
        />
        <Route path={routes.About} element={<OpportunityAboutPage />} />
        <Route path={routes.Agreements} element={<OpportunityAgreementsPage paths={currentPaths} />} />

        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}`}
          element={
            <CalloutsPage
              entityTypeName="opportunity"
              rootUrl={`${resolved.pathname}/${routes.Explore}`}
              scrollToCallout
            />
          }
        />
        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}/*`}
          element={
            <CalloutRoute parentPagePath={`${resolved.pathname}/${routes.Explore}`} entityTypeName={'opportunity'} />
          }
        />
      </Route>
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OpportunityRoute;
