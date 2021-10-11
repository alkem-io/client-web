import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OpportunityAdminAuthorizationPage from '../../../pages/Admin/Opportunity/OpportunityAdminAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OpportunityAuthorizationRouteProps extends AuthorizationRouteProps {}

const OpportunityAuthorizationRoute: FC<OpportunityAuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/admins`}>
        <OpportunityAdminAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default OpportunityAuthorizationRoute;
