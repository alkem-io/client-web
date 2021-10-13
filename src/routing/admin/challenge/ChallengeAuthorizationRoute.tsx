import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../../pages';
import AuthorizationRouteProps from '../AuthorizationRouteProps';
import ChallengeAuthorizationPage from '../../../pages/Admin/Challenge/ChallengeAuthorizationPage';
import { nameOfUrl } from '../../url-params';

const ChallengeAuthorizationRoute: FC<AuthorizationRouteProps> = ({ paths, resourceId = '' }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'authorization', real: false }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}/:${nameOfUrl.role}`}>
        <ChallengeAuthorizationPage paths={currentPaths} resourceId={resourceId} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default ChallengeAuthorizationRoute;
