import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { AdminPage } from '../components/Admin';
import { FourOuFour } from '../pages';
/*local files imports end*/

export const Admin: FC = () => {
  const { path } = useRouteMatch();
  // const { data, loading } = useUsersQuery();
  // const users = (data?.users || []) as UserModel[];

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <AdminPage />
      </Route>
      {/* <Route exact path={`${path}/users`}>
        <UserList users={users} />
      </Route>
      <Route path={`${path}/users/new`}>
        <UserForm user={defaultUser} editMode={EditMode.new} title={'User creation'} />
      </Route>
      <Route exact path={`${path}/users/:userId/edit`}>
        <User mode={EditMode.edit} />
      </Route>
      <Route exact path={`${path}/users/:userId`}>
        <User mode={EditMode.readOnly} />
      </Route> */}
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
