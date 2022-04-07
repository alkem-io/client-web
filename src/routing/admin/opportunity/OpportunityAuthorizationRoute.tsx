import React, { FC } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Error404 } from '../../../pages';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import OpportunityAuthorizationPage from '../../../pages/Admin/Opportunity/OpportunityAuthorization/OpportunityAuthorizationPage';
import { useAppendPath } from '../../../hooks/usePathUtils';

interface OpportunityAuthorizationRouteProps extends AuthorizationRouteProps {}

const OpportunityAuthorizationRoute: FC<OpportunityAuthorizationRouteProps> = ({ paths }) => {
  const currentPaths = useAppendPath(paths, { name: 'authorization' });

  return (
    <Routes>
      <Route index element={<Navigate to="admins" replace />} />
      <Route path="admins" element={<OpportunityAuthorizationPage paths={currentPaths} routePrefix="../../" />}></Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default OpportunityAuthorizationRoute;
