import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AuthorizationRouteProps from './AuthorizationRouteProps';
import GlobalAuthorizationPage from '../../pages/Admin/GlobalAuthorizationPage';
import { FourOuFour } from '../../pages';

const GlobalAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:role`}>
        <GlobalAuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default GlobalAuthorizationRoute;
