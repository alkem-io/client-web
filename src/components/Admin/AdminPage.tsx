import { useMutation } from '@apollo/client';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { UserModel } from '../../models/User';
import AdminLayout from './AdminLayout';
import { MUTATION_SAVE_USER } from './query';
import { EditMode, UserInput } from './UserInput';
import { UserList } from './UserList';

export const AdminPage: FC = () => {
  const { path } = useRouteMatch();
  const { data, loading } = useUsersQuery();
  // const [createUser, newUser] = useCreateUserMutation();
  const users = (data?.users || []) as UserModel[];

  const handleSaveUser = (user: UserModel) => {
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
              <UserInput users={users} editMode={EditMode.new} onSave={handleSaveUser} />
            </Route>
            <Route exact path={`${path}/users/:userId/edit`}>
              <UserInput users={users} editMode={EditMode.edit} onSave={handleSaveUser} />
            </Route>
            <Route exact path={`${path}/users/:userId`}>
              <UserInput users={users} onSave={handleSaveUser} />
            </Route>
          </Switch>
        </Container>
      )}
    </AdminLayout>
  );
};
