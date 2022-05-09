import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../pages';
import ChallengeAuthorizationPage from '../../../challenge/pages/ChallengeAuthorization/ChallengeAuthorizationPage';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
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
