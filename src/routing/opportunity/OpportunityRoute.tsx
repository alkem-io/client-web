import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, OpportunityPage, PageProps } from '../../pages';
import OpportunityCommunityPage from '../../pages/Community/OpportunityCommunityPage';
import RestrictedRoute from '../route.extensions';
import { ProjectRoute } from './ProjectRoute';

interface OpportunityRootProps extends PageProps {}

const OpportunityRoute: FC<OpportunityRootProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { opportunity, displayName, loading } = useOpportunity();

  const currentPaths = useMemo(
    () => (displayName ? [...paths, { value: url, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunity) {
    return <Error404 />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        <OpportunityPage paths={currentPaths} />
      </Route>
      <RestrictedRoute path={`${path}/community`}>
        <OpportunityCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={`${path}/projects`}>
        <ProjectRoute paths={currentPaths} projects={opportunity.projects} opportunityId={opportunity.id} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default OpportunityRoute;
