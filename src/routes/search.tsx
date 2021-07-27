import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTransactionScope } from '../hooks';
import { FourOuFour } from '../pages';
import { SearchPage } from '../pages/SearchPage';

export const Search: FC = () => {
  // const { t } = useTranslation();

  useTransactionScope({ type: 'connect(search)' });

  const { path } = useRouteMatch();
  const currentPaths = useMemo(
    () => [
      // { value: url, name: t('search.header'), real: true }
    ],
    []
  );

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <SearchPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
