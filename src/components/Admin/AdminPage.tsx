import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
/*lib imports end*/

import { defaultUser, UserModel } from '../../models/User';
import AdminLayout from './AdminLayout';
import User from './User';
import { EditMode, UserForm } from './UserForm';
import { UserList } from './UserList';
/*local files imports end*/

export const AdminPage: FC = () => {
  const { path } = useRouteMatch();
  const { data, loading } = useUsersQuery();
  const users = (data?.users || []) as UserModel[];

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
              <UserForm user={defaultUser} editMode={EditMode.new} title={'User creation'} />
            </Route>
            <Route exact path={`${path}/users/:userId/edit`}>
              <User mode={'edit'} />
            </Route>
            <Route exact path={`${path}/users/:userId`}>
              <User mode={'readOnly'} />
            </Route>
          </Switch>
        </Container>
      )}
    </AdminLayout>
  );
};
