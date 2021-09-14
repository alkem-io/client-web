import React, { FC, useMemo } from 'react';
import { PageProps } from '../pages';
import { Route, Switch, useRouteMatch } from 'react-router';
import CommunityPage from '../pages/community/CommunityPage';

const CommunityRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={path}>
        <CommunityPage paths={currentPaths} />
      </Route>
    </Switch>
  );
};
export default CommunityRoute;
