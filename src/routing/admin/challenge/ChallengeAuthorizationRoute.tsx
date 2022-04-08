import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import ChallengeAuthorizationPage from '../../../pages/Admin/Challenge/ChallengeAuthorization/ChallengeAuthorizationPage';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';

const ChallengeAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId = '' }) => {
  const currentPaths = useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <Routes>
      <Route
        index
        element={<ChallengeAuthorizationPage resourceId={resourceId} paths={currentPaths} routePrefix="../../" />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default ChallengeAuthorizationRoute;
