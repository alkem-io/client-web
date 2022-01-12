import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../pages';
import ChallengeAuthorizationPage from '../../../pages/Admin/Challenge/ChallengeAuthorizationPage';
import { nameOfUrl } from '../../url-params';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

const ChallengeAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId = '' }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={`:${nameOfUrl.role}`}>
        <ChallengeAuthorizationPage paths={currentPaths} resourceId={resourceId} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default ChallengeAuthorizationRoute;
