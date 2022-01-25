import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../pages';
import ChallengeAuthorizationPage from '../../../pages/Admin/Challenge/ChallengeAuthorizationPage';
import { nameOfUrl } from '../../url-params';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

const ChallengeAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId = '' }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route
        path={`:${nameOfUrl.role}`}
        element={<ChallengeAuthorizationPage paths={currentPaths} resourceId={resourceId} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default ChallengeAuthorizationRoute;
