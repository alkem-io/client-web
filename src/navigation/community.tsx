import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { community } from '../components/core/Typography.dummy.json';
import { Community as CommunityPage, FourOuFour } from '../pages';

export const Community: FC = () => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: community.header, real: true }], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <CommunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
