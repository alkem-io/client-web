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
import OpportunityDashboardView from '../../views/Opportunity/OpportunityDashboardView';
import OpportunityContextView from '../../views/Opportunity/OpportunityContextView';
import OpportunityCommunityPage from '../../pages/Community/OpportunityCommunityPage';
import OpportunityProjectsView from '../../views/Opportunity/OpportunityProjectsView';
import OpportunityCanvasView from '../../views/Opportunity/OpportunityCanvasManagementView';

interface OpportunityRootProps extends PageProps {}

const OpportunityRouteNew: FC<OpportunityRootProps> = ({ paths }) => {
  const { opportunity, displayName, ecoverseNameId, challengeNameId, opportunityNameId, loading, permissions } =
    useOpportunity();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [...paths, { value: resolved.pathname, name: displayName, real: true }] : paths),
    [paths, displayName, resolved]
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
                element={
                  <OpportunityDashboardView
                    entities={e}
                    state={{
                      loading: s.loading,
                      showInterestModal: e.showInterestModal,
                      showActorGroupModal: e.showActorGroupModal,
                      error: s.error,
                    }}
                    actions={a}
                    options={e.permissions}
                  />
                }
              />
              <Route
                path={'context'}
                element={
                  <OpportunityContextView
                    entities={e}
                    state={{
                      showActorGroupModal: e.showActorGroupModal,
                      loading: s.loading,
                      error: s.error,
                    }}
                    actions={a}
                    options={e.permissions}
                  />
                }
              />
              <Route path={'community'} element={<OpportunityCommunityPage paths={paths} />} />
              <Route
                path={'projects'}
                element={
                  <OpportunityProjectsView
                    entities={{
                      opportunityProjects: e.opportunityProjects,
                    }}
                    state={{}}
                    actions={{}}
                    options={{}}
                  />
                }
              />
              <Route
                path={'canvases'}
                element={
                  <OpportunityCanvasView
                    entities={e}
                    state={{
                      loading: s.loading,
                      error: s.error,
                    }}
                    actions={undefined}
                    options={undefined}
                  />
                }
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
