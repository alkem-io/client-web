import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import { ProjectRoute } from './ProjectRoute';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { OpportunityPageContainer } from '../../containers';
import OpportunityTabsNew from './OpportunityTabsNew';
import OpportunityCommunityPage from '../../pages/Community/OpportunityCommunityPage';
import OpportunityDashboardPage from '../../pages/Opportunity/OpportunityDashboardPage';
import OpportunityContextPage from '../../pages/Opportunity/OpportunityContextPage';
import OpportunityProjectsPage from '../../pages/Opportunity/OpportunityProjectsPage';
import OpportunityCanvasPage from '../../pages/Opportunity/OpportunityCanvasPage';

interface OpportunityRootProps extends PageProps {}

const OpportunityRouteNew: FC<OpportunityRootProps> = ({ paths: _paths }) => {
  const { opportunity, displayName, ecoverseNameId, challengeNameId, opportunityNameId, loading, permissions } =
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
    <DiscussionsProvider>
      <OpportunityPageContainer>
        {(e, s, a) => (
          <Routes>
            <Route
              path={'/'}
              element={
                <OpportunityTabsNew
                  communityReadAccess={e.permissions.communityReadAccess}
                  viewerCanUpdate={permissions.viewerCanUpdate}
                  ecoverseNameId={ecoverseNameId}
                  challengeNameId={challengeNameId}
                  opportunityNameId={opportunityNameId}
                />
              }
            >
              <Route index element={<Navigate replace to={'dashboard'} />} />
              <Route
                path={'dashboard'}
                element={<OpportunityDashboardPage paths={currentPaths} entities={e} state={s} actions={a} />}
              />
              <Route
                path={'context'}
                element={<OpportunityContextPage paths={currentPaths} entities={e} state={s} actions={a} />}
              />
              <Route path={'community'} element={<OpportunityCommunityPage paths={currentPaths} />} />
              <Route path={'projects'} element={<OpportunityProjectsPage paths={currentPaths} entities={e} />} />
              <Route
                path={'canvases'}
                element={<OpportunityCanvasPage paths={currentPaths} entities={e} state={s} />}
              />
            </Route>
            <Route path={'projects/*'} element={<ProjectRoute paths={currentPaths} />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        )}
      </OpportunityPageContainer>
    </DiscussionsProvider>
  );
};
export default OpportunityRouteNew;
