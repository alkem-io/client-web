import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OpportunityAdminAuthorizationPage from '../../../pages/Admin/Opportunity/OpportunityAdminAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OpportunityAuthorizationRouteProps extends AuthorizationRouteProps {}

const OpportunityAuthorizationRoute: FC<OpportunityAuthorizationRouteProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={'admins'}>
        <OpportunityAdminAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default OpportunityAuthorizationRoute;
