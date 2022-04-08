import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import HubAuthorizationPage from '../../../pages/Admin/Hub/HubAuthorization/HubAuthorizationPage';

const HubAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId }) => {
  const currentPaths = useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <Routes>
      <Route
        index
        element={<HubAuthorizationPage paths={currentPaths} resourceId={resourceId} routePrefix="../../" />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default HubAuthorizationRoute;
