import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Community as CommunityPage, FourOuFour } from '../pages';

export const Community: FC = () => {
  const { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}`}>
        <CommunityPage />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
