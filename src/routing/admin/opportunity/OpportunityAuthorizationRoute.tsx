import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../pages';
import OpportunityAdminAuthorizationPage from '../../../pages/Admin/Opportunity/OpportunityAdminAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

interface OpportunityAuthorizationRouteProps extends AuthorizationRouteProps {}

const OpportunityAuthorizationRoute: FC<OpportunityAuthorizationRouteProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={'admins'} element={<OpportunityAdminAuthorizationPage paths={currentPaths} />}></Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OpportunityAuthorizationRoute;
