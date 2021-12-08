import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../pages';
import GlobalAuthorizationPage from '../../pages/Admin/GlobalAuthorizationPage';
import GlobalCommunityAuthorizationPage from '../../pages/Admin/GlobalCommunityAuthorizationPage';
import AuthorizationRouteProps from './AuthorizationRouteProps';
import { nameOfUrl } from '../url-params';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:${nameOfUrl.role}`}>
        <GlobalAuthorizationPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/community/:${nameOfUrl.role}`}>
        <GlobalCommunityAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default GlobalAuthorizationRoute;
