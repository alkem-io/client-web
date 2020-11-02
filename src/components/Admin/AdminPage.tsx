import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { UserModel } from '../../models/User';
import AdminLayout from './AdminLayout';
import { EditMode, UserFrom } from './UserFrom';
import { UserList } from './UserList';

export const AdminPage: FC = () => {
  const { path } = useRouteMatch();
  const { data, loading } = useUsersQuery();
  const users = (data?.users || []) as UserModel[];

  const handleSaveUser = (_user: UserModel) => {
    console.log('Saving...');
  };

  return (
    <AdminLayout>
      <h1 style={{ textAlign: 'center' }}>Admin Page</h1>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <Container>
          <Switch>
            <Route exact path={`${path}/users`}>
              <UserList users={users} />
            </Route>
            <Route path={`${path}/users/new`}>
              <UserFrom users={users} editMode={EditMode.new} onSave={handleSaveUser} />
            </Route>
            <Route exact path={`${path}/users/:userId/edit`}>
              <UserFrom users={users} editMode={EditMode.edit} onSave={handleSaveUser} />
            </Route>
            <Route exact path={`${path}/users/:userId`}>
              <UserFrom users={users} onSave={handleSaveUser} />
            </Route>
          </Switch>
        </Container>
      )}
    </AdminLayout>
  );
};
