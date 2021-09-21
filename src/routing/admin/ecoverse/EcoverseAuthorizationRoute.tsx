import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour } from '../../../pages';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import EcoverseAuthorizationPage from '../../../pages/Admin/Ecoverse/EcoverseAuthorizationPage';
import { nameOfUrl } from '../../url-params';

const EcoverseAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:${nameOfUrl.role}`}>
        <EcoverseAuthorizationPage paths={currentPaths} resourceId={resourceId} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default EcoverseAuthorizationRoute;
