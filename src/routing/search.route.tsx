import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTransactionScope } from '../hooks';
import { Error404 } from '../pages';
import { SearchPage } from '../pages/Search/SearchPage';

export const SearchRoute: FC = () => {
  useTransactionScope({ type: 'connect(search)' });

  const { path } = useRouteMatch();
  const currentPaths = useMemo(() => [], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <SearchPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
