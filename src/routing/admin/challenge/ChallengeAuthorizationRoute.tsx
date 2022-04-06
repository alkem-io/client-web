import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import ChallengeAuthorizationPage from '../../../pages/Admin/Challenge/ChallengeAuthorization/ChallengeAuthorizationPage';
import { nameOfUrl } from '../../url-params';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import { AuthorizationCredential } from '../../../models/graphql-schema';

const ChallengeAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId = '' }) => {
  return (
    <Routes>
      <Route index element={<Navigate to={AuthorizationCredential.ChallengeAdmin} replace />} />
      <Route
        path={`:${nameOfUrl.role}`}
        element={<ChallengeAuthorizationPage paths={paths} resourceId={resourceId} routePrefix="../../" />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default ChallengeAuthorizationRoute;
