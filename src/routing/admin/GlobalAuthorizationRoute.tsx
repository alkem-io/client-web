import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../pages';
import GlobalAuthorizationPage from '../../pages/Admin/GlobalAuthorizationPage';
import GlobalCommunityAuthorizationPage from '../../pages/Admin/GlobalCommunityAuthorizationPage';
import { nameOfUrl } from '../url-params';
import AuthorizationRouteProps from './AuthorizationRouteProps';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Routes>
      <Route path={`:${nameOfUrl.role}`} element={<GlobalAuthorizationPage paths={currentPaths} />}></Route>
      <Route
        path={`community/:${nameOfUrl.role}`}
        element={<GlobalCommunityAuthorizationPage paths={currentPaths} />}
      ></Route>
      <Route path="*" element={<Error404 />}></Route>
    </Routes>
  );
};
export default GlobalAuthorizationRoute;
