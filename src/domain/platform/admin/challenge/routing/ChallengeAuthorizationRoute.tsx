import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import ChallengeAuthorizationPage from '../../../../challenge/challenge/pages/ChallengeAuthorization/ChallengeAuthorizationPage';
import { useAppendBreadcrumb } from '../../../../../core/routing/usePathUtils';
import AuthorizationRouteProps from '../../routing/AuthorizationRouteProps';

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
