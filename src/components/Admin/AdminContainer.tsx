import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { AdminPage } from './AdminPage';
import GroupPage from './GroupPage';
import UserPage from './UserPage';

export const AdminContainer: FC = () => {
  const { path } = useRouteMatch();
  return (
    <AdminLayout>
      <Container fluid style={{ marginTop: '1em' }}>
        <Switch>
          <Route exact path={`${path}`}>
            <AdminPage />
          </Route>
          <Route path={`${path}/users`}>
            <UserPage />
          </Route>
          <Route path={`${path}/groups`}>
            <GroupPage />
          </Route>
        </Switch>
      </Container>
    </AdminLayout>
  );
};
export default AdminContainer;
