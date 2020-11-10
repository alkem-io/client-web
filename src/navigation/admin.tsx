import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
/*lib imports end*/
import { AdminLayout, AdminPage, GroupPage, UserPage } from '../components/Admin';
import { FourOuFour } from '../pages';
/*local files imports end*/

export const Admin: FC = () => {
  const { path, url } = useRouteMatch();

  return (
    <AdminLayout>
      <Switch>
        <Route exact path={`${path}`}>
          <AdminPage />
        </Route>
        <Route path={`${path}/users`}>
          {/* <UserPage paths={currentPaths} /> */}
          <UserPage />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupPage />
        </Route>
        <Route path="*">
          <FourOuFour />
        </Route>
      </Switch>
    </AdminLayout>
  );
};
