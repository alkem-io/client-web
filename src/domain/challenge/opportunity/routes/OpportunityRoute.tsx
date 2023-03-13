import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../../../common/components/core/Loading/Loading';
import { useOpportunity } from '../hooks/useOpportunity';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import OpportunityAgreementsPage from '../pages/OpportunityAgreementsPage';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import { EntityPageLayoutHolder } from '../../common/EntityPageLayout';
import { routes } from './opportunityRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import OpportunityAboutPage from '../pages/OpportunityAboutPage';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import Redirect from '../../../../core/routing/Redirect';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths: _paths }) => {
  const {
    profile: { displayName },
    opportunityNameId,
    loading,
  } = useOpportunity();
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
        <Route path={routes.Contribute} element={<ContributePage entityTypeName="opportunity" />} />
        <Route path={routes.About} element={<OpportunityAboutPage />} />
        <Route path={routes.Agreements} element={<OpportunityAgreementsPage paths={currentPaths} />} />
        <Route
          path={`${routes.Contribute}/callouts/:${nameOfUrl.calloutNameId}`}
          element={<ContributePage entityTypeName="opportunity" scrollToCallout />}
        />
        <Route
          path={`${routes.Contribute}/callouts/:${nameOfUrl.calloutNameId}/*`}
          element={
            <ContributePage entityTypeName="opportunity">
              <CalloutRoute parentPagePath={`${resolved.pathname}/${routes.Contribute}`} entityTypeName="opportunity" />
            </ContributePage>
          }
        />
      </Route>
      <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OpportunityRoute;
