import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AuthorizationPage from '../../pages/Admin/AuthorizationPage';
import { FourOuFour, PageProps } from '../../pages';

interface AuthorizationRouteProps extends PageProps {}

export const AuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:globalRole`}>
        <AuthorizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default AuthorizationRoute;
