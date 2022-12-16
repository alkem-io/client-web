import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppendBreadcrumb } from '../../../../../core/routing/usePathUtils';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import HubAuthorizationPage from '../../../../challenge/hub/pages/HubAuthorization/HubAuthorizationPage';
import AuthorizationRouteProps from '../../routing/AuthorizationRouteProps';

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
