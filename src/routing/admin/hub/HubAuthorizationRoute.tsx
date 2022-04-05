import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import { nameOfUrl } from '../../url-params';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import { useAppendPath } from '../../../hooks/usePathUtils';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import HubAuthorizationPage from '../../../pages/Admin/Hub/HubAuthorization/HubAuthorizationPage';

const HubAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId }) => {
  const currentPaths = useAppendPath(paths, { name: 'authorization' });

  return (
    <Routes>
      <Route index element={<Navigate to={AuthorizationCredential.HubAdmin} replace />} />
      <Route
        path={`:${nameOfUrl.role}`}
        element={<HubAuthorizationPage paths={currentPaths} resourceId={resourceId} routePrefix="../../" />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default HubAuthorizationRoute;
