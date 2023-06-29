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
import OpportunityCollaborationPage from '../OpportunityCollaborationPage/OpportunityCollaborationPage';
import { StorageConfigContextProvider } from '../../../platform/storage/StorageBucket/StorageConfigContext';

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

  if (!opportunityNameId) {
    return <Error404 />;
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
          <Route path={routes.Contribute} element={<ContributePage journeyTypeName="opportunity" />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={<OpportunityCollaborationPage />}
          />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={
              <OpportunityCollaborationPage>{props => <CalloutRoute {...props} />}</OpportunityCollaborationPage>
            }
          />
          <Route path={routes.About} element={<OpportunityAboutPage />} />
          <Route path={routes.Agreements} element={<OpportunityAgreementsPage paths={currentPaths} />} />
        </Route>
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default OpportunityRoute;
