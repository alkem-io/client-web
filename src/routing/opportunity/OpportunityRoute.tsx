import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import { ProjectRoute } from './ProjectRoute';
import OpportunityTabs from './OpportunityTabs';
import OpportunityCommunityPage from '../../pages/Community/OpportunityCommunityPage';
import OpportunityDashboardPage from '../../pages/Opportunity/OpportunityDashboardPage';
import OpportunityContextPage from '../../pages/Opportunity/OpportunityContextPage';
import OpportunityProjectsPage from '../../pages/Opportunity/OpportunityProjectsPage';
import OpportunityCanvasPage from '../../pages/Opportunity/OpportunityCanvasPage';
import { nameOfUrl } from '../url-params';
import AspectProvider from '../../context/aspect/AspectProvider';
import AspectRoute from '../aspect/AspectRoute';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths: _paths }) => {
  const { opportunity, displayName, hubNameId, challengeNameId, opportunityNameId, loading, permissions } =
    useOpportunity();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunity) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <OpportunityTabs
            communityReadAccess={permissions.communityReadAccess}
            viewerCanUpdate={permissions.viewerCanUpdate}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunityNameId}
          />
        }
      >
        <Route index element={<Navigate replace to={'dashboard'} />} />
        <Route path={'dashboard'} element={<OpportunityDashboardPage paths={currentPaths} />} />
        <Route path={'context'} element={<OpportunityContextPage paths={currentPaths} />} />
        <Route path={'community'} element={<OpportunityCommunityPage paths={currentPaths} />} />
        <Route path={'projects'} element={<OpportunityProjectsPage paths={currentPaths} />} />
        <Route path={'canvases'} element={<OpportunityCanvasPage paths={currentPaths} />} />
      </Route>
      <Route path={'projects/*'} element={<ProjectRoute paths={currentPaths} />} />
      <Route
        path={`aspects/:${nameOfUrl.aspectNameId}/*`}
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
