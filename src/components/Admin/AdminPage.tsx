import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import GroupPage from './GroupPage';
import UserPage from './UserPage';

export const AdminPage: FC = () => {
  const { path } = useRouteMatch();
  return (
    <AdminLayout>
      <Switch>
        <Route exact path={`${path}`}>
          <>
            <h2 style={{ textAlign: 'center' }}>Admin Page</h2>
            <hr />
            <div> Put some data and navigation for the admin page.</div>
          </>
        </Route>
        <Route path={`${path}/users`}>
          <UserPage />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupPage />
        </Route>
      </Switch>
    </AdminLayout>
  );
};
export default AdminPage;
