import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import { ProjectRoute } from './ProjectRoute';
import OpportunityDashboardPage from '../../pages/Opportunity/OpportunityDashboardPage';
import OpportunityContextPage from '../../pages/Opportunity/OpportunityContextPage';
import OpportunityProjectsPage from '../../pages/Opportunity/OpportunityProjectsPage';
import ContributePage from '../../pages/Contribute/ContributePage';
import { nameOfUrl } from '../url-params';
import AspectProvider from '../../context/aspect/AspectProvider';
import AspectRoute from '../aspect/AspectRoute';
import { EntityPageLayoutHolder } from '../../domain/shared/layout/PageLayout';
import { routes } from '../../domain/opportunity/routes/opportunityRoutes';

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
        <Route path={routes.Dashboard} element={<OpportunityDashboardPage paths={currentPaths} />} />
        <Route path={routes.Explore} element={<ContributePage entityTypeName="opportunity" />} />
        <Route path={routes.About} element={<OpportunityContextPage paths={currentPaths} />} />
        <Route path={routes.Agreements} element={<OpportunityProjectsPage paths={currentPaths} />} />
      </Route>
      <Route path={`${routes.Agreements}/*`} element={<ProjectRoute paths={currentPaths} />} />
      <Route
        path={`contribute/aspects/:${nameOfUrl.aspectNameId}/*`}
        element={
          <AspectProvider>
            <AspectRoute paths={currentPaths} />
          </AspectProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default OpportunityRoute;
