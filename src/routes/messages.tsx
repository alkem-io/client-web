import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { FourOuFour, Messages as MessagesPage } from '../pages';

export const Messages: FC = () => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'messages', real: true }], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <MessagesPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
