import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Redirect } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useOpportunity } from '../../hooks';
import { Error404, OpportunityPage, PageProps } from '../../pages';
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
        <Redirect to={`${url}/dashboard`} />
      </Route>
      {/* /projects should be matched by the generic route, not this one. */}
      <Route strict path={`${path}/projects/`}>
        <ProjectRoute paths={currentPaths} />
      </Route>
      <Route path={path}>
        <OpportunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default OpportunityRoute;
