import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { Error404 } from '../../../../pages';
import AuthorizationRouteProps from '../../routing/AuthorizationRouteProps';
import OpportunityAuthorizationPage from '../pages/OpportunityAuthorization/OpportunityAuthorizationPage';

interface OpportunityAuthorizationRouteProps extends AuthorizationRouteProps {}

const OpportunityAuthorizationRoute: FC<OpportunityAuthorizationRouteProps> = ({ paths }) => {
  const currentPaths = useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <Routes>
      <Route index element={<OpportunityAuthorizationPage paths={currentPaths} routePrefix="../../" />} />
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OpportunityAuthorizationRoute;
