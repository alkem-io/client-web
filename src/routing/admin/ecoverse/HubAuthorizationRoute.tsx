import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404 } from '../../../pages';
import HubAuthorizationPage from '../../../pages/Admin/Hub/HubAuthorizationPage';
import { nameOfUrl } from '../../url-params';
import AuthorizationRouteProps from '../AuthorizationRouteProps';

const HubAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route
        path={`:${nameOfUrl.role}`}
        element={<HubAuthorizationPage paths={currentPaths} resourceId={resourceId} />}
      ></Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default HubAuthorizationRoute;
