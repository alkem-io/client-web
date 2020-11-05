import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { AdminPage } from '../components/Admin';
import { FourOuFour } from '../pages';
/*local files imports end*/

export const Admin: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`}>
        <AdminPage />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
